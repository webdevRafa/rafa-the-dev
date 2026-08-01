import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const ADMIN_UID = 'AWkiCHBAwZPIPHTlsBGXIfLTaBs1'

function readLocalEnvironment() {
  const environmentPath = resolve('.env.local')
  if (!existsSync(environmentPath)) return {}

  return Object.fromEntries(
    readFileSync(environmentPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=')
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      }),
  )
}

async function seedUncleAdmin() {
  const localEnvironment = readLocalEnvironment()
  const projectId = process.env.FIREBASE_PROJECT_ID || localEnvironment.VITE_FIREBASE_PROJECT_ID

  if (!projectId) {
    throw new Error('Missing Firebase project ID. Add VITE_FIREBASE_PROJECT_ID to .env.local.')
  }

  const app = getApps()[0] ?? initializeApp({
    credential: applicationDefault(),
    projectId,
  })
  const adminAuth = getAuth(app)
  const adminDatabase = getFirestore(app)
  const user = await adminAuth.getUser(ADMIN_UID)

  if (!user.email) {
    throw new Error(`Firebase Auth user ${ADMIN_UID} does not have an email address.`)
  }

  await adminAuth.setCustomUserClaims(ADMIN_UID, {
    ...(user.customClaims ?? {}),
    admin: true,
    role: 'admin',
  })

  const userReference = adminDatabase.collection('users').doc(ADMIN_UID)
  const existingProfile = await userReference.get()
  const existingData = existingProfile.data() ?? {}
  const profile = {
    uid: ADMIN_UID,
    email: user.email.toLowerCase(),
    displayName: existingData.displayName || user.displayName || user.email.split('@')[0],
    role: 'admin',
    status: 'active',
    permissions: {
      submissions: 'manage',
      leads: 'manage',
      clients: 'manage',
      users: 'self',
    },
    updatedAt: FieldValue.serverTimestamp(),
  }

  await userReference.set(
    existingProfile.exists
      ? profile
      : { ...profile, createdAt: FieldValue.serverTimestamp() },
    { merge: true },
  )

  console.log(`Seeded users/${ADMIN_UID} and assigned the admin claim to ${user.email}.`)
  console.log('The account can now sign in at /admin. If already signed in, sign out and back in first.')
}

seedUncleAdmin().catch((error) => {
  console.error('Unable to seed the additional admin account.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
