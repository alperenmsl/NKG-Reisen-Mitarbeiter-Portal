import { Building2, Calendar, FileText, Hash, Mail, Tag, User } from "lucide-react"
import type { ReactNode } from "react"
import type { DataEntry } from "../lib/firestore"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

function formatDate(value: Date | undefined): string | null {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value)
  } catch {
    return null
  }
}

function isPrimitive(v: unknown): v is string | number | boolean | null | undefined {
  const t = typeof v
  return t === "string" || t === "number" || t === "boolean" || v == null
}

function toText(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string") return v
  if (typeof v === "number") return String(v)
  if (typeof v === "boolean") return v ? "Ja" : "Nein"
  if (v instanceof Date) return formatDate(v) ?? ""
  return ""
}

type FieldCandidate = {
  key: string
  value: string
  icon: ReactNode
}

function pickFieldCandidates(entry: DataEntry): { primary?: FieldCandidate; secondary?: FieldCandidate; description?: string } {
  const titleKeys = ["title", "name", "betreff", "subject", "titel", "headline", "header"]
  const emailKeys = ["email", "eMail", "mail", "E-Mail", "emailAddress"]
  const nameKeys = ["mitarbeiter", "author", "erstelltVon", "createdBy", "user", "vorname", "nachname", "fullName"]
  const categoryKeys = ["kategorie", "category", "type", "typ", "status", "prioritaet", "priority", "tag"]
  const textKeys = [
    "description",
    "text",
    "inhalt",
    "content",
    "body",
    "nachricht",
    "message",
    "details",
    "info",
    "zusammenfassung",
  ]

  const keys = Object.keys(entry.fields)
  const findVal = (keysToCheck: string[]): string | undefined => {
    for (const k of keysToCheck) {
      const match = keys.find((x) => x.toLowerCase() === k.toLowerCase())
      if (match && entry.fields[match] != null && toText(entry.fields[match]).length > 0) {
        return toText(entry.fields[match])
      }
    }
    return undefined
  }

  const title = findVal(titleKeys)
  const email = findVal(emailKeys)
  const name = findVal(nameKeys)
  const category = findVal(categoryKeys)
  const description = findVal(textKeys)

  const primary: FieldCandidate | undefined = title
    ? { key: titleKeys.join("/"), value: title, icon: <FileText className="h-4 w-4" /> }
    : email
      ? { key: emailKeys.join("/"), value: email, icon: <Mail className="h-4 w-4" /> }
      : name
        ? { key: nameKeys.join("/"), value: name, icon: <User className="h-4 w-4" /> }
        : undefined

  const secondary: FieldCandidate | undefined = category
    ? { key: categoryKeys.join("/"), value: category, icon: <Tag className="h-4 w-4" /> }
    : name && primary?.value !== name
      ? { key: nameKeys.join("/"), value: name, icon: <User className="h-4 w-4" /> }
      : email && primary?.value !== email
        ? { key: emailKeys.join("/"), value: email, icon: <Mail className="h-4 w-4" /> }
        : undefined

  return { primary, secondary, description }
}

function ExtraFields({ entry }: { entry: DataEntry }) {
  const extras = Object.entries(entry.fields)
    .filter(([, v]) => isPrimitive(v) && toText(v).length > 0)
    .map(([k, v]) => ({ key: k, value: toText(v) }))
    .filter(({ value }) => value.length > 0)
    .slice(0, 6)

  if (extras.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
      {extras.map(({ key, value }) => (
        <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5">
          <div className="font-medium text-slate-500">{key}</div>
          <div className="truncate text-slate-700">{value}</div>
        </div>
      ))}
    </div>
  )
}

function DataCard({ entry }: { entry: DataEntry }) {
  const { primary, secondary, description } = pickFieldCandidates(entry)
  const fallbackTitle = primary?.value ?? entry.id
  const updatedAt = formatDate(entry.updatedAt ?? entry.createdAt)
  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/[0.02] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:border-[#a19a97]/40 hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] hover:ring-black/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#a19a97]">
            <Hash className="h-3.5 w-3.5" />
            <span className="truncate font-medium">{entry.id}</span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
            {fallbackTitle}
          </h3>
        </div>
        {secondary && (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-300 group-hover:border-[#a19a97]/40 group-hover:bg-[#a19a97]/10 group-hover:text-[#4a4643]">
            {secondary.icon}
            <span className="max-w-[160px] truncate">{secondary.value}</span>
          </span>
        )}
      </div>

      {description && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{description}</p>
      )}

      <div className="mt-4 space-y-3">
        <ExtraFields entry={entry} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#a19a97]" />
          <span className="truncate">{updatedAt ?? "Kein Datum"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Building2 className="h-3.5 w-3.5" />
          <span className="max-w-[180px] truncate">{entry.path}</span>
        </div>
      </div>
    </article>
  )
}

type DataSectionProps = {
  data: DataEntry[]
  loading: boolean
  error: string | null
  collectionName: string
  onRetry?: () => void
}

export function DataSection({ data, loading, error, collectionName, onRetry }: DataSectionProps) {
  return (
    <section className="mt-10 w-full">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#a19a97]">
            DATA
          </div>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Sammlung
            </h2>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 shadow-sm">
              {collectionName}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Alle Einträge aus deiner Firebase-Datenbank werden hier live synchronisiert. Neue Dokumente erscheinen automatisch.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-medium text-slate-700">{loading ? "Lade…" : `${data.length} Einträge`}</div>
          {!loading && data.length > 0 && (
            <div className="mt-0.5 text-[11px] text-slate-400">Firestore · Echtzeit</div>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/60 p-5 shadow-[0_10px_40px_rgb(0,0,0,0.04)] backdrop-blur-[2px] ring-1 ring-black/[0.02]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-6rem] h-60 w-60 rounded-full bg-[#a19a97]/10 blur-3xl"
        />

        {error && (
          <div className="relative z-10 mb-4 flex items-start justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-sm text-rose-700">
            <div>
              <div className="font-semibold">Laden fehlgeschlagen</div>
              <div className="mt-0.5 text-rose-600/90">{error}</div>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Erneut versuchen
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="relative z-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm"
              >
                <div className="h-3 w-28 rounded-full bg-slate-200" />
                <div className="mt-4 h-6 w-2/3 rounded-lg bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded-md bg-slate-100" />
                <div className="mt-2 h-4 w-5/6 rounded-md bg-slate-100" />
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <div className="h-10 rounded-lg bg-slate-100" />
                  <div className="h-10 rounded-lg bg-slate-100" />
                </div>
                <div className="mt-5 h-px w-full bg-slate-100" />
                <div className="mt-4 flex justify-between">
                  <div className="h-3 w-40 rounded-md bg-slate-200" />
                  <div className="h-3 w-32 rounded-md bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="relative z-10 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-[#a19a97] shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
              Noch keine Einträge
            </div>
            <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
              Füge Dokumente in Firestore zur Collection <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[12px] font-medium text-slate-700">{collectionName}</code> hinzu. Dann erscheinen sie hier automatisch.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "relative z-10 grid gap-5",
              data.length === 1 ? "sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {data.map((entry) => (
              <DataCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
