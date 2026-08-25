import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { getFirebaseDB } from "./firebase"

export type DataEntry = {
  id: string
  path: string
  fields: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
  exists: boolean
}

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value
  if (
    value &&
    typeof value === "object" &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    try {
      return (value as { toDate: () => Date }).toDate()
    } catch {
      return undefined
    }
  }
  return undefined
}

function snapshotToEntry(snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>): DataEntry {
  const data = snap.data() ?? {}
  return {
    id: snap.id,
    path: snap.ref.path,
    fields: data,
    createdAt: toDate((data as { createdAt?: unknown }).createdAt),
    updatedAt: toDate((data as { updatedAt?: unknown }).updatedAt),
    exists: snap.exists(),
  }
}

export const DATA_COLLECTION_NAME = (import.meta.env.VITE_FIRESTORE_DATA_COLLECTION as string | undefined) ??
  "home_data"

export function useHomeDataCollection() {
  const [data, setData] = useState<DataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let cancelled = false

    async function start() {
      try {
        setLoading(true)
        setError(null)

        const db = getFirebaseDB()
        const base = collection(db, DATA_COLLECTION_NAME)
        const q: Query<DocumentData> = query(base, orderBy("updatedAt", "desc"))

        try {
          unsubscribe = onSnapshot(
            q,
            { includeMetadataChanges: false },
            (snapshot) => {
              if (cancelled) return
              const entries: DataEntry[] = snapshot.docs.map((d) => snapshotToEntry(d))
              setData(entries)
              setLoading(false)
            },
            (err) => {
              if (cancelled) return
              setLoading(false)
              setError(err instanceof Error ? err.message : "Laden fehlgeschlagen.")
            }
          )
        } catch {
          unsubscribe = onSnapshot(
            collection(db, DATA_COLLECTION_NAME),
            (snapshot) => {
              if (cancelled) return
              const entries: DataEntry[] = snapshot.docs.map((d) => snapshotToEntry(d))
              setData(entries)
              setLoading(false)
            },
            (err) => {
              if (cancelled) return
              setLoading(false)
              setError(err instanceof Error ? err.message : "Laden fehlgeschlagen.")
            }
          )
        }
      } catch (err) {
        if (cancelled) return
        setLoading(false)
        setError(err instanceof Error ? err.message : "Laden fehlgeschlagen.")
      }
    }

    void start()

    return () => {
      cancelled = true
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch {
          // ignore
        }
      }
    }
  }, [])

  return { data, loading, error, collectionName: DATA_COLLECTION_NAME }
}
