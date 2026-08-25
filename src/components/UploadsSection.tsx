import { useMemo, useState } from "react"
import {
  Bus,
  CheckCircle2,
  Clock,
  Hash,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from "lucide-react"
import type { BusUpload } from "../lib/busesUploads"
import { cn } from "../lib/utils"

function UploadedAtBadge({ value }: { value?: string }) {
  if (!value) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
        <Clock className="h-3 w-3" />
        kein Datum
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
      <Clock className="h-3 w-3 text-emerald-600" />
      {value}
    </span>
  )
}

function ConsentChip({ given }: { given?: boolean }) {
  if (given === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        zugestimmt
      </span>
    )
  }
  if (given === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
        <XCircle className="h-3 w-3" />
        nicht zugestimmt
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-100 bg-slate-50/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      k.A.
    </span>
  )
}

function ParticipantItem({ p }: { p: NonNullable<BusUpload["teilnehmer"]>[number] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-[#a19a97]/40 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)]">
              {(p.vorname?.[0] ?? "?").toUpperCase()}
              {(p.nachname?.[0] ?? "").toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {p.vorname ?? "—"} {p.nachname ?? ""}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3 text-[#a19a97]" />
                <span className="truncate">{p.reiseziel ?? "kein Reiseziel"}</span>
              </div>
            </div>
          </div>
        </div>
        <ConsentChip given={p.zustimmung} />
      </div>

      <div className="mt-3 grid gap-2 text-[12px] text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{p.email ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{p.telefon ?? "—"}</span>
        </div>
      </div>
    </div>
  )
}

function UploadCard({ upload }: { upload: BusUpload }) {
  const destinations = new Set<string>()
  upload.teilnehmer.forEach((t) => {
    if (t.reiseziel && t.reiseziel.trim().length > 0) destinations.add(t.reiseziel.trim())
  })
  const consentCount = upload.teilnehmer.filter((t) => t.zustimmung === true).length

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_12px_50px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.02] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:border-[#a19a97]/40 hover:shadow-[0_28px_80px_rgba(15,23,42,0.10)] hover:ring-black/[0.04]">
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#a19a97]">
            <Hash className="h-3.5 w-3.5" />
            <span className="truncate font-medium">{upload.id}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1 text-[12px] font-semibold text-slate-700 shadow-sm">
              <Bus className="h-3.5 w-3.5 text-[#a19a97]" />
              Bus: <span className="font-bold text-slate-900">{upload.busId}</span>
            </span>
            <UploadedAtBadge value={upload.uploadedAt} />
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            <Users className="h-3.5 w-3.5" />
            Teilnehmer
          </div>
          <div className="mt-1 text-[28px] font-bold leading-none tracking-tight text-slate-900">
            {upload.teilnehmer.length}
          </div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            {consentCount}/{upload.teilnehmer.length} mit Zustimmung
          </div>
        </div>
      </div>

      {destinations.size > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-dashed border-slate-100 bg-white/70 px-6 py-3 text-[11px]">
          <span className="font-semibold uppercase tracking-wide text-slate-500">Reiseziele:</span>
          {Array.from(destinations)
            .sort((a, b) => a.localeCompare(b))
            .map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-medium text-slate-700"
              >
                <MapPin className="h-3 w-3 text-[#a19a97]" />
                {d}
              </span>
            ))}
        </div>
      )}

      <div className="grid gap-3 bg-white px-6 py-5">
        {upload.teilnehmer.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
            Keine Teilnehmer in diesem Upload.
          </div>
        ) : (
          <>
            {upload.teilnehmer.slice(0, 6).map((p, idx) => (
              <ParticipantItem key={`${upload.id}-p-${idx}`} p={p} />
            ))}
            {upload.teilnehmer.length > 6 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-2 text-center text-[12px] font-medium text-slate-500">
                + weitere {upload.teilnehmer.length - 6} Teilnehmer im selben Upload.
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-slate-100 bg-slate-50/50 px-6 py-3.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{upload.teilnehmer.length} Personen</span>
        </div>
        <div className="max-w-[60%] truncate font-mono text-[10px] text-slate-400">{upload.path}</div>
      </div>
    </article>
  )
}

type Props = {
  uploads: BusUpload[]
  loading: boolean
  error: string | null
  stats: { totalUploads: number; totalParticipants: number; withConsent: number; busesCount: number }
  onRetry?: () => void
}

export function UploadsSection({ uploads, loading, error, stats, onRetry }: Props) {
  const [q, setQ] = useState("")
  const [filterBus, setFilterBus] = useState<string>("all")

  const busOptions = useMemo(() => {
    const set = new Set<string>()
    uploads.forEach((u) => set.add(u.busId))
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [uploads])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return uploads.filter((u) => {
      if (filterBus !== "all" && u.busId !== filterBus) return false
      if (!needle) return true
      if (u.id.toLowerCase().includes(needle)) return true
      if (u.busId.toLowerCase().includes(needle)) return true
      if (u.uploadedAt?.toLowerCase().includes(needle)) return true
      return u.teilnehmer.some((p) => {
        return (
          p.vorname?.toLowerCase().includes(needle) ||
          p.nachname?.toLowerCase().includes(needle) ||
          p.email?.toLowerCase().includes(needle) ||
          p.telefon?.toLowerCase().includes(needle) ||
          p.reiseziel?.toLowerCase().includes(needle)
        )
      })
    })
  }, [uploads, q, filterBus])

  const statCards = [
    {
      label: "Uploads",
      value: stats.totalUploads,
      hint: "Gesamte Uploads",
      icon: Bus,
      accent: "from-[#0b2c40] to-[#174866]",
    },
    {
      label: "Teilnehmer",
      value: stats.totalParticipants,
      hint: "Summe aller Personen",
      icon: Users,
      accent: "from-[#a19a97] to-[#746c6a]",
    },
    {
      label: "Mit Zustimmung",
      value: stats.withConsent,
      hint: "Datenverwendung erlaubt",
      icon: ShieldCheck,
      accent: "from-emerald-700 to-emerald-500",
    },
    {
      label: "Busse",
      value: stats.busesCount,
      hint: "Unterschiedliche Bus IDs",
      icon: Hash,
      accent: "from-slate-800 to-slate-600",
    },
  ] as const

  return (
    <section className="mt-10 w-full">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#a19a97]">
            GEWINNSPIEL-DATEN
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Uploads aus deiner Firebase Datenbank
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Alle Uploads aus <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[12px] font-medium text-slate-700">buses/*/uploads/*</code> live synchronisiert. Neue Uploads erscheinen automatisch.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-medium text-slate-700">{loading ? "Lade…" : `${filtered.length} Uploads · ${uploads.length} gesamt`}</div>
          {!loading && uploads.length > 0 && <div className="mt-0.5 text-[11px] text-slate-400">Firestore · Echtzeit</div>}
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, hint, icon: Icon, accent }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.05)] ring-1 ring-black/[0.02] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-14 -right-10 h-36 w-36 rounded-full opacity-10 blur-3xl bg-gradient-to-br",
                accent
              )}
            />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
                <div className="mt-2 text-[32px] font-bold leading-none tracking-tight text-slate-900">{value}</div>
                <div className="mt-2 text-[11px] text-slate-500">{hint}</div>
              </div>
              <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md", accent)}>
                <Icon className="h-4.5 w-4.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/60 p-5 shadow-[0_10px_40px_rgb(0,0,0,0.04)] backdrop-blur-[2px] ring-1 ring-black/[0.02]">
        <div aria-hidden className="pointer-events-none absolute -top-32 right-[-6rem] h-60 w-60 rounded-full bg-[#a19a97]/10 blur-3xl" />

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

        <div className="relative z-10 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suche nach Name, E-Mail, Reiseziel, Bus, Upload-Datum…"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-[13px] text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#a19a97]/60 focus:ring-4 focus:ring-[#a19a97]/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="bus-filter" className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Bus
            </label>
            <select
              id="bus-filter"
              value={filterBus}
              onChange={(e) => setFilterBus(e.target.value)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#a19a97]/60 focus:ring-4 focus:ring-[#a19a97]/10"
            >
              {busOptions.map((b) => (
                <option key={b} value={b}>
                  {b === "all" ? "Alle Busse" : b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="relative z-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[360px] animate-pulse rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5"
              >
                <div className="h-3 w-40 rounded-full bg-slate-200" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-10 w-40 rounded-2xl bg-slate-100" />
                  <div className="h-10 w-16 rounded-2xl bg-slate-100" />
                </div>
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <div key={j} className="h-24 rounded-2xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="relative z-10 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-[#a19a97] shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
              {uploads.length === 0 ? "Noch keine Uploads vorhanden" : "Keine Treffer"}
            </div>
            <p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
              {uploads.length === 0
                ? "Sobald das Gewinnspiel-Formular Daten in Firestore unter buses/{busId}/uploads/… schreibt, erscheinen sie hier automatisch."
                : "Versuche einen anderen Suchbegriff oder wähle einen anderen Bus aus."}
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((u) => (
              <UploadCard key={u.path} upload={u} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
