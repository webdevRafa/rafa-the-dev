import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const ADMIN_UID = 'T7p16Z5nOmbcgaJhjUIO3I1OvZ33'
const ADMIN_EMAIL = 'ralphvdo420@gmail.com'

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

async function seedAdmin() {
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

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error(
      `UID ${ADMIN_UID} belongs to ${user.email ?? 'an account without an email'}, not ${ADMIN_EMAIL}.`,
    )
  }

  await adminAuth.setCustomUserClaims(ADMIN_UID, {
    ...(user.customClaims ?? {}),
    admin: true,
    role: 'admin',
  })

  const userReference = adminDatabase.collection('users').doc(ADMIN_UID)
  const existingProfile = await userReference.get()
  const profile = {
    uid: ADMIN_UID,
    email: ADMIN_EMAIL,
    displayName: 'Ralph',
    role: 'admin',
    status: 'active',
    permissions: {
      submissions: 'manage',
      leads: 'manage',
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

  console.log(`Seeded users/${ADMIN_UID} and assigned the admin claim to ${ADMIN_EMAIL}.`)
  console.log('Sign out of /admin and sign in again so Firebase issues a token with the new claim.')
}

seedAdmin().catch((error) => {
  console.error('Unable to seed the admin account.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
