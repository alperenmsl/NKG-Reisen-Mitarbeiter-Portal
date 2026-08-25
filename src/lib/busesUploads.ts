import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { useEffect, useMemo, useState } from "react"
import { getFirebaseDB } from "./firebase"

export type UploadParticipant = {
  email?: string
  nachname?: string
  reiseziel?: string
  telefon?: string
  vorname?: string
  zustimmung?: boolean
  [key: string]: unknown
}

export type BusUpload = {
  id: string
  busId: string
  path: string
  teilnehmer: UploadParticipant[]
  uploadedAt?: string
  createdAt?: Date
  updatedAt?: Date
  raw: Record<string, unknown>
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

function parseParticipants(list: unknown): UploadParticipant[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((e) => e && typeof e === "object")
    .map((e) => ({
      email: typeof (e as UploadParticipant).email === "string" ? (e as UploadParticipant).email : undefined,
      nachname: typeof (e as UploadParticipant).nachname === "string" ? (e as UploadParticipant).nachname : undefined,
      reiseziel: typeof (e as UploadParticipant).reiseziel === "string" ? (e as UploadParticipant).reiseziel : undefined,
      telefon: typeof (e as UploadParticipant).telefon === "string" ? (e as UploadParticipant).telefon : undefined,
      vorname: typeof (e as UploadParticipant).vorname === "string" ? (e as UploadParticipant).vorname : undefined,
      zustimmung: typeof (e as UploadParticipant).zustimmung === "boolean" ? (e as UploadParticipant).zustimmung : undefined,
      ...(e as Record<string, unknown>),
    }))
}

function parseUpload(doc: {
  id: string
  ref: { path: string }
  data: () => DocumentData | undefined
}): BusUpload {
  const data = (doc.data() ?? {}) as Record<string, unknown>
  const pathParts = doc.ref.path.split("/")
  const busIndex = pathParts.indexOf("buses")
  const busId = busIndex >= 0 ? pathParts[busIndex + 1] ?? "unknown" : "unknown"

  return {
    id: doc.id,
    busId,
    path: doc.ref.path,
    teilnehmer: parseParticipants(data.teilnehmer),
    uploadedAt: typeof data.uploadedAt === "string" ? data.uploadedAt : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    raw: data,
  }
}

function parseUploadedAt(value: string | undefined): number {
  if (!value) return 0
  try {
    const cleaned = value.replace(/\./g, "/").replace(/,/g, " ").trim()
    const parsed = Date.parse(cleaned)
    if (!Number.isNaN(parsed)) return parsed
  } catch {
    // ignore
  }
  return 0
}

// Fallback: Diese Bus-IDs laden wir IMMER explizit, auch wenn das Bus-Dokument
// selbst keine Felder hat (Firestore liefert solche Dokumente bei /buses nicht zurück).
const KNOWN_BUS_IDS = ["WEB_PORTAL"]

export function useBusUploads() {
  const [uploads, setUploads] = useState<BusUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const subUnsubscribers: Array<() => void> = []

    async function start() {
      try {
        setLoading(true)
        setError(null)
        const db = getFirebaseDB()

        const busIds = new Set<string>(KNOWN_BUS_IDS)

        try {
          const busesSnapshot = await getDocs(collection(db, "buses"))
          busesSnapshot.docs.forEach((d) => busIds.add(d.id))
        } catch {
          // Falls das Abfragen der Top-Collection fehlschlägt, nutzen wir trotzdem KNOWN_BUS_IDS
        }

        const partial = new Map<string, BusUpload>()
        let firstError: string | null = null

        function emit() {
          const list = Array.from(partial.values())
            .slice()
            .sort((a, b) => parseUploadedAt(b.uploadedAt) - parseUploadedAt(a.uploadedAt))
          setUploads(list)
        }

        if (busIds.size === 0) {
          if (!cancelled) {
            setLoading(false)
            setError(null)
          }
          return
        }

        let remaining = busIds.size
        const busIdsArr = Array.from(busIds)

        busIdsArr.forEach((busId) => {
          try {
            const busRef = doc(db, "buses", busId)
            const uploadsRef = collection(busRef, "uploads")
            const unsub = onSnapshot(
              uploadsRef,
              { includeMetadataChanges: false },
              (subSnapshot) => {
                if (cancelled) return
                subSnapshot.docs.forEach((d) => {
                  partial.set(d.ref.path, parseUpload(d))
                })
                emit()
              },
              (err) => {
                if (cancelled) return
                if (!firstError) {
                  firstError = err instanceof Error ? err.message : "Lesen fehlgeschlagen."
                  setError(firstError)
                }
              }
            )
            subUnsubscribers.push(unsub)
          } catch (err) {
            if (!firstError) {
              firstError = err instanceof Error ? err.message : "Lesen fehlgeschlagen."
              setError(firstError)
            }
          } finally {
            remaining -= 1
            if (remaining <= 0 && !cancelled) {
              setLoading(false)
              // Error nur setzen, wenn WIRKLICH nichts gelesen werden konnte.
              if (!firstError || partial.size > 0) setError(null)
            }
          }
        })
      } catch (err) {
        if (cancelled) return
        setLoading(false)
        setError(err instanceof Error ? err.message : "Laden fehlgeschlagen.")
      }
    }

    void start()

    return () => {
      cancelled = true
      subUnsubscribers.forEach((u) => {
        try {
          u()
        } catch {
          // ignore
        }
      })
    }
  }, [])

  const stats = useMemo(() => {
    let totalParticipants = 0
    let withConsent = 0
    const buses = new Set<string>()
    uploads.forEach((u) => {
      buses.add(u.busId)
      totalParticipants += u.teilnehmer.length
      u.teilnehmer.forEach((p) => {
        if (p.zustimmung === true) withConsent += 1
      })
    })
    return {
      totalUploads: uploads.length,
      totalParticipants,
      withConsent,
      busesCount: buses.size,
    }
  }, [uploads])

  return { uploads, loading, error, stats }
}

export function getAllDestinations(uploads: BusUpload[]): string[] {
  const set = new Set<string>()
  uploads.forEach((u) => {
    u.teilnehmer.forEach((t) => {
      if (t.reiseziel && t.reiseziel.trim().length > 0) {
        set.add(t.reiseziel.trim())
      }
    })
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}
