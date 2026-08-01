# Firebase data architecture

Both public forms write to a single top-level `submissions` collection. A shared collection creates one operational inbox and makes it straightforward to query all new leads by status and submission time. Each document is discriminated by `submissionType`, while form-specific fields stay isolated inside `payload`.

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
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

For stronger automated-abuse protection, add Firebase App Check before a high-traffic promotion. The validation rules limit accepted fields and sizes, but no client-only form can fully prevent bots.
