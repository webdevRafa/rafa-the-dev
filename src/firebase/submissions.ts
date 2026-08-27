import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseConfig'
import type { ProjectBudget } from '../projectInquiryOptions'

const SUBMISSIONS_COLLECTION = 'submissions'
const SCHEMA_VERSION = 1

type SubmissionSource = {
  site: 'rafa-the-dev'
  route: '/'
  formId: 'homepage-project-inquiry'
  campaignId: string
}

export type ProjectInquiryInput = {
  name: string
  email: string
  business: string
  message: string
  timing: string
  budget: ProjectBudget | ''
}

function cleanText(value: string, maximumLength: number) {
  return value.trim().slice(0, maximumLength)
}

function cleanEmail(value: string) {
  return cleanText(value, 254).toLowerCase()
}

function baseSubmission(
  source: SubmissionSource,
) {
  return {
    schemaVersion: SCHEMA_VERSION,
    submissionType: 'project_inquiry',
    status: 'new',
    submittedAt: serverTimestamp(),
    source,
  } as const
}

export async function submitProjectInquiry(input: ProjectInquiryInput) {
  const submission = {
    ...baseSubmission({
      site: 'rafa-the-dev',
      route: '/',
      formId: 'homepage-project-inquiry',
      campaignId: '',
    }),
    contact: {
      name: cleanText(input.name, 120),
      email: cleanEmail(input.email),
      business: cleanText(input.business, 160),
      phone: '',
      location: '',
      instagram: '',
    },
    payload: {
      capabilities: [],
      message: cleanText(input.message, 5000),
      timing: cleanText(input.timing, 80),
      budget: cleanText(input.budget, 80),
    },
  }

  const submissionReference = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submission)
  return submissionReference.id
}
