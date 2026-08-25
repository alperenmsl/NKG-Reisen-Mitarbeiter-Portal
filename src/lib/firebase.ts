import { initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function normalizeEnv(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : ""
  return s.replace(/^['"]|['"]$/g, "").trim()
}

const firebaseConfig: FirebaseConfig = {
  apiKey: normalizeEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: normalizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: normalizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: normalizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: normalizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: normalizeEnv(import.meta.env.VITE_FIREBASE_APP_ID),
}

export const firebaseConfigured = Object.values(firebaseConfig).every((v) => Boolean(v))

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function getFirebaseAuth(): Auth {
  if (!firebaseConfigured) {
    throw new Error("FIREBASE_NOT_CONFIGURED")
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  if (!auth) {
    auth = getAuth(app)
  }
  return auth
}

export function getFirebaseDB(): Firestore {
  if (!firebaseConfigured) {
    throw new Error("FIREBASE_NOT_CONFIGURED")
  }
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  if (!db) {
    db = getFirestore(app)
  }
  return db
}
