import { initializeApp } from 'firebase-admin/app'
import { FieldValue } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { defineSecret } from 'firebase-functions/params'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { Resend } from 'resend'
import {
  buildConfirmationEmail,
  type SubmissionType,
} from './emailTemplates.js'

initializeApp()

const resendApiKey = defineSecret('RESEND_API_KEY')

const EMAIL_FROM = 'Rafa the Dev <hello@rafathedev.com>'
const EMAIL_REPLY_TO = 'rafathedev@gmail.com'
const MAX_RETRY_AGE_MS = 6 * 60 * 60 * 1000

type UnknownRecord = Record<string, unknown>

type ResendErrorLike = {
  name?: string
  message?: string
  statusCode?: number
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(record: UnknownRecord, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value.trim() : ''
}

function isSubmissionType(value: unknown): value is SubmissionType {
  return value === 'project_inquiry' || value === 'free_website_application'
}

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getCurrentConfirmationStatus(data: UnknownRecord) {
  const emailDelivery = data.emailDelivery
  if (!isRecord(emailDelivery)) return ''

  const confirmation = emailDelivery.confirmation
  if (!isRecord(confirmation)) return ''

  return getString(confirmation, 'status')
}

function toResendError(error: unknown): ResendErrorLike {
  if (!isRecord(error)) {
    return { message: error instanceof Error ? error.message : 'Unknown Resend error' }
  }

  const resendError: ResendErrorLike = {
    message: typeof error.message === 'string' ? error.message : 'Unknown Resend error',
  }

  if (typeof error.name === 'string') resendError.name = error.name
  if (typeof error.statusCode === 'number') resendError.statusCode = error.statusCode

  return resendError
}

function isTransientError(error: ResendErrorLike) {
  return error.statusCode === undefined || error.statusCode === 408 || error.statusCode === 429
    || error.statusCode >= 500
}

function hasRetryWindowExpired(eventTime: string | undefined) {
  if (!eventTime) return false

  const eventTimestamp = Date.parse(eventTime)
  return Number.isFinite(eventTimestamp) && Date.now() - eventTimestamp > MAX_RETRY_AGE_MS
}

function safeErrorMessage(error: ResendErrorLike) {
  return (error.message || error.name || 'Email provider error').slice(0, 500)
}

async function updateDeliveryStatus(
  submissionReference: FirebaseFirestore.DocumentReference,
  fields: UnknownRecord,
) {
  await submissionReference.set({
    emailDelivery: {
      confirmation: {
        ...fields,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
  }, { merge: true })
}

export const sendSubmissionConfirmationEmail = onDocumentCreated({
  document: 'submissions/{submissionId}',
  region: 'us-central1',
  secrets: [resendApiKey],
  retry: true,
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 5,
}, async (event) => {
  const submissionSnapshot = event.data
  const submissionId = event.params.submissionId

  if (!submissionSnapshot) {
    logger.warn('Submission create event did not include a document snapshot.', { submissionId })
    return
  }

  const latestSnapshot = await submissionSnapshot.ref.get()
  const submission = latestSnapshot.data()

  if (!submission || !isRecord(submission)) {
    logger.warn('Submission no longer exists or has invalid data.', { submissionId })
    return
  }

  if (getCurrentConfirmationStatus(submission) === 'sent') {
    logger.info('Confirmation email was already sent; skipping duplicate event.', { submissionId })
    return
  }

  const submissionType = submission.submissionType
  const contact = submission.contact

  if (!isSubmissionType(submissionType) || !isRecord(contact)) {
    await updateDeliveryStatus(submissionSnapshot.ref, {
      status: 'failed',
      errorCode: 'invalid_submission',
      errorMessage: 'Submission type or contact data is invalid.',
    })
    logger.error('Cannot send confirmation for an invalid submission.', { submissionId })
    return
  }

  const name = getString(contact, 'name')
  const email = getString(contact, 'email').toLowerCase()
  const business = getString(contact, 'business')

  if (!isValidEmail(email)) {
    await updateDeliveryStatus(submissionSnapshot.ref, {
      status: 'failed',
      errorCode: 'invalid_recipient',
      errorMessage: 'The submitted recipient email address is invalid.',
    })
    logger.error('Cannot send confirmation to an invalid recipient.', { submissionId })
    return
  }

  const confirmationEmail = buildConfirmationEmail({
    submissionType,
    name,
    business,
  })

  await updateDeliveryStatus(submissionSnapshot.ref, {
    status: 'processing',
    provider: 'resend',
    recipient: email,
    templateKey: confirmationEmail.templateKey,
    attempts: FieldValue.increment(1),
    errorCode: null,
    errorMessage: null,
  })

  try {
    const resend = new Resend(resendApiKey.value())
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      replyTo: EMAIL_REPLY_TO,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
      text: confirmationEmail.text,
      tags: [
        { name: 'category', value: 'submission-confirmation' },
        { name: 'submission_type', value: submissionType },
      ],
    }, {
      idempotencyKey: `${confirmationEmail.templateKey}/${submissionId}`,
    })

    if (error) {
      const resendError = toResendError(error)
      const canRetry = isTransientError(resendError) && !hasRetryWindowExpired(event.time)

      await updateDeliveryStatus(submissionSnapshot.ref, {
        status: canRetry ? 'retrying' : 'failed',
        errorCode: resendError.name || 'resend_error',
        errorMessage: safeErrorMessage(resendError),
      })

      if (canRetry) {
        throw new Error(`Transient Resend error: ${resendError.statusCode ?? 'network'}`)
      }

      logger.error('Resend rejected a confirmation email.', {
        submissionId,
        statusCode: resendError.statusCode,
        errorName: resendError.name,
      })
      return
    }

    await updateDeliveryStatus(submissionSnapshot.ref, {
      status: 'sent',
      providerMessageId: data?.id ?? null,
      sentAt: FieldValue.serverTimestamp(),
      errorCode: null,
      errorMessage: null,
    })

    logger.info('Submission confirmation email sent.', {
      submissionId,
      submissionType,
      providerMessageId: data?.id,
    })
  } catch (error) {
    const resendError = toResendError(error)
    const canRetry = !hasRetryWindowExpired(event.time)

    await updateDeliveryStatus(submissionSnapshot.ref, {
      status: canRetry ? 'retrying' : 'failed',
      errorCode: resendError.name || 'send_exception',
      errorMessage: safeErrorMessage(resendError),
    })

    if (canRetry) {
      throw error
    }

    logger.error('Confirmation email retry window expired.', { submissionId })
  }
})
