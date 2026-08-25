import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase"

type AuthState = {
  user: User | null
  loading: boolean
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    if (!firebaseConfigured) {
      setState({ user: null, loading: false })
      return
    }

    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false })
    })

    return () => unsub()
  }, [])

  return state
}

