import { getApp, getApps, initializeApp } from 'firebase/app'
import type { FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function requireEnvironmentVariable(name: keyof ImportMetaEnv) {
  const value = import.meta.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${name}`)
  }

  return value
}

export const firebaseConfig: FirebaseOptions = {
  apiKey: requireEnvironmentVariable('VITE_FIREBASE_API_KEY'),
  authDomain: requireEnvironmentVariable('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnvironmentVariable('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnvironmentVariable('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnvironmentVariable('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnvironmentVariable('VITE_FIREBASE_APP_ID'),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || undefined,
}

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
