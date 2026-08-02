# Firebase data architecture

Both public forms write to a single top-level `submissions` collection. A shared collection creates one operational inbox and makes it straightforward to query all new leads by status and submission time. Each document is discriminated by `submissionType`, while form-specific fields stay isolated inside `payload`.

New submissions also trigger the Resend confirmation-email function. Setup and deployment instructions are in [`functions/README.md`](../functions/README.md). The function appends `emailDelivery.confirmation` metadata after creation; this server-owned operational data does not change the public create schema below.

```text
submissions/{autoId}
  schemaVersion: 1
  submissionType: project_inquiry | free_website_application
  status: new
  submittedAt: server timestamp
  source:
    site
    route
    formId
    campaignId
  contact:
    name
    email
    business
    phone
    location
    instagram
  payload:
    form-specific fields
```

The campaign ID for `/free-website` defaults to `free-website`. Set `VITE_FREE_WEBSITE_CAMPAIGN_ID` in Vercel when a new promotion needs its own reporting segment.

## Security model

The included rules allow anonymous visitors to create only schema-valid documents whose initial status is `new`. Public reads, updates, and deletes are denied. Management access requires Firebase Authentication plus an `admin: true` custom claim; enabling Google sign-in by itself does not grant access to submissions.

Before production use, deploy the rules and indexes from the project root:

```sh
firebase login
firebase use --add
firebase deploy --only firestore
```

For stronger automated-abuse protection, add Firebase App Check before a high-traffic promotion. The validation rules limit accepted fields and sizes, but no client-only form can fully prevent bots.

## Admin and lead architecture

The private `/admin` route uses Firebase Email/Password Authentication. Firestore access is authorized by a trusted `admin: true` custom claim in the signed-in user's ID token. The matching `users/{uid}` document stores profile and permission metadata for display and future account management; editing that document from a client cannot grant access.

```text
users/{uid}
  uid
  email
  displayName
  role: admin
  status: active
  permissions
  createdAt
  updatedAt

leads/{submissionId}
  submissionId
  submissionType
  stage: new | contacted | qualified | proposal | won | lost
  contact
  source
  notes
  createdAt / createdBy
  updatedAt / updatedBy

clients/{leadId}
  leadId
  submissionId
  submissionType
  status: active | completed | archived
  websiteUrl
  contact
  source
  notes
  createdAt / createdBy
  updatedAt / updatedBy
```

Using the submission ID as the lead ID makes conversion idempotent. The dashboard creates the lead and marks the original submission as `lead` in one Firestore transaction.

The same ID is reused when a lead becomes a client, so conversion remains idempotent and the full chain is easy to follow: submission -> lead -> client. A client conversion copies the operational contact/source snapshot into `clients`, moves the lead to `won`, and marks the original submission as `client` in one transaction. The original records stay in place as history. The client record owns the editable `websiteUrl` and its Active/Completed/Archived lifecycle.

### Seed the first admin

The seed script verifies that UID `T7p16Z5nOmbcgaJhjUIO3I1OvZ33` belongs to `ralphvdo420@gmail.com`, creates exactly one `users/{uid}` document, and assigns the account's trusted admin custom claim.

1. In Firebase Console, open **Project settings → Service accounts** and generate a private key.
2. Save the JSON outside this repository.
3. From PowerShell in the project root, run:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\rafa-the-dev-service-account.json"
npm run seed:admin
Remove-Item Env:\GOOGLE_APPLICATION_CREDENTIALS
```

Never commit the service-account JSON. After seeding, deploy the updated rules and indexes with `firebase deploy --only firestore`, then sign out and sign back in at `/admin` so Firebase refreshes the ID token.

### Seed the additional admin

The additional-admin script targets the existing Firebase Authentication user with UID `AWkiCHBAwZPIPHTlsBGXIfLTaBs1`. It reads the account's email directly from Firebase Authentication, preserves any existing custom claims, assigns `admin: true`, and creates or updates `users/{uid}`.

From PowerShell in the project root:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Ralph\Downloads\rafa-the-dev-firebase-adminsdk-fbsvc-c2283bf813.json"
npm run seed:uncle-admin
Remove-Item Env:\GOOGLE_APPLICATION_CREDENTIALS
```

This script runs locally with the Admin SDK; it is not deployed as a Cloud Function. The new admin should sign out and back in before opening `/admin` if the account was already signed in when the claim was assigned.
