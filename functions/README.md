# Submission confirmation emails

`sendSubmissionConfirmationEmail` is a second-generation Cloud Function that runs whenever either public form creates a document in `submissions/{submissionId}`. The browser never receives the Resend API key and the form does not wait for the email provider before showing its success state.

The function sends one of two transactional confirmations:

- Project inquiry: confirms receipt, explains that Rafa will personally review the details, and sets the expectation that scope, timeline, and pricing are agreed before work begins.
- Free website application: confirms the entry, points the applicant to `@rafathedev` for promotion updates, and confirms that a selected winner will also be contacted directly by email.

Every email includes HTML and plain-text versions, uses the submission ID as a Resend idempotency key, retries transient failures for up to six hours, and writes operational status to:

```text
submissions/{submissionId}.emailDelivery.confirmation
  status: processing | retrying | sent | failed
  provider: resend
  recipient
  templateKey
  attempts
  providerMessageId
  sentAt
  updatedAt
  errorCode
  errorMessage
```

## One-time Resend setup

1. In Resend, add and verify `rafathedev.com`. Resend will provide the SPF and DKIM DNS records. A verified domain is required to send to customers outside the email address used by the Resend account.
2. Create a Resend API key with sending access.
3. From the project root, store the API key in Google Cloud Secret Manager through Firebase:

```powershell
firebase login
firebase use rafa-the-dev
firebase functions:secrets:set RESEND_API_KEY
```

Paste the `re_...` value when Firebase prompts. Do not add it to `.env.local` or commit it.

The function currently sends from `Rafa the Dev <hello@rafathedev.com>` and uses `rafathedev@gmail.com` as the reply-to address. The sending domain must be verified in the same Resend account that owns the API key.

## Install, verify, and deploy

From the project root:

```powershell
npm install --prefix functions
npm run functions:test
firebase deploy --only functions:sendSubmissionConfirmationEmail
```

To deploy every configured function later:

```powershell
firebase deploy --only functions
```

No frontend or Firestore rules deployment is required for this email function. The Admin SDK writes delivery metadata after the schema-valid public submission has already been created.

## Production check

After deployment, submit each public form once with an email address you can access. Confirm all three of the following:

1. The message arrives and replies address `rafathedev@gmail.com`.
2. Resend shows the email as delivered.
3. The submission document contains `emailDelivery.confirmation.status: "sent"`.

Function logs are available with:

```powershell
firebase functions:log --only sendSubmissionConfirmationEmail
```

If a recipient or provider rejects a message, the submission retains a `failed` or `retrying` status and a short error description for troubleshooting.
