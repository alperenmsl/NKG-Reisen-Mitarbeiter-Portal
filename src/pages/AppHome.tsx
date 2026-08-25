import { useMemo, useState } from "react"
import { signOut } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import AppSidebar from "@/components/AppSidebar"
import DigitalCountdown from "@/components/DigitalCountdown"
import { useCountdown } from "@/hooks/useCountdown"
import { formatPeriod, getCurrentRafflePeriod } from "@/lib/rafflePeriod"
import { cn } from "@/lib/utils"
import { UploadsSection } from "@/components/UploadsSection"
import { useBusUploads } from "@/lib/busesUploads"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function AppHome() {
  const [error, setError] = useState<string | null>(null)
  const period = useMemo(() => getCurrentRafflePeriod(new Date()), [])
  const remaining = useCountdown(period.end)
  const { uploads, loading, error: dataError, stats } = useBusUploads()
  const [reloadKey, setReloadKey] = useState(0)

  async function onLogout() {
    try {
      setError(null)
      await signOut(getFirebaseAuth())
    } catch {
      setError("Abmelden fehlgeschlagen.")
    }
  }

  function onRetryData() {
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="flex min-h-screen">
        <AppSidebar active="home" onLogout={onLogout} />

        <main className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(161,154,151,0.16),transparent_55%)]" />

          <div className="relative mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:px-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-[12px] font-semibold tracking-[0.22em] text-slate-500">HOME</div>
                <div className="mt-2 text-[28px] font-semibold tracking-tight text-slate-900">Willkommen zurück</div>
                <div className="mt-1 text-[13px] text-slate-600">
                  Aktueller Zeitraum: {formatPeriod(period.start)} – {formatPeriod(period.end)}
                </div>
              </div>
              <div className="hidden text-right lg:block">
                <div className="text-[12px] font-semibold tracking-[0.22em] text-slate-500">STATUS</div>
                <div className="mt-2 text-[13px] font-semibold text-slate-900">Gewinnspiel läuft</div>
                <div className="mt-1 text-[12px] text-slate-500">Endet automatisch nach 4 Monaten</div>
              </div>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <DigitalCountdown
                title="GEWINNSPIEL"
                subtitle="Verbleibende Zeit bis zum Ende der aktuellen Runde"
                days={remaining.days}
                hours={remaining.hours}
                minutes={remaining.minutes}
                seconds={remaining.seconds}
              />

              <div className="grid gap-6">
                <div
                  className={cn(
                    "rounded-[28px] border border-slate-200/60 bg-white/85 p-6",
                    "shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur-xl",
                    "transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-slate-200/70 hover:bg-white/85 hover:shadow-[0_26px_80px_rgba(15,23,42,0.14)]"
                  )}
                >
                  <div className="text-[12px] font-semibold tracking-[0.22em] text-slate-500">HINWEIS</div>
                  <div className="mt-2 text-[15px] font-semibold text-slate-900">Teilnahme & Updates</div>
                  <div className="mt-2 text-[13px] leading-relaxed text-slate-600">
                    Alle Uploads aus Firestore (buses &rarr; uploads) erscheinen automatisch unten. Sortiert nach neuestem Upload-Datum.
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-[28px] border border-slate-200/60 bg-white/85 p-6",
                    "shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur-xl",
                    "transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-slate-200/70 hover:bg-white/85 hover:shadow-[0_26px_80px_rgba(15,23,42,0.14)]"
                  )}
                >
                  <div className="text-[12px] font-semibold tracking-[0.22em] text-slate-500">KONTO</div>
                  <div className="mt-2 text-[15px] font-semibold text-slate-900">Schnellaktionen</div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-slate-800 hover:shadow-[0_14px_40px_rgba(15,23,42,0.22)] active:translate-y-[0px]"
                    >
                      Abmelden
                    </button>
                    <button
                      type="button"
                      onClick={onRetryData}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-[0px]"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-[#a19a97]" />
                      Daten aktualisieren
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-[0px]"
                    >
                      Profil (bald)
                    </button>
                  </div>
                  {error ? <div className="mt-3 text-[12px] font-medium text-rose-600">{error}</div> : null}
                  {dataError ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-[12px] text-rose-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Daten konnten nicht geladen werden – Firestore Rules / Auth prüfen.</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div key={reloadKey}>
              <UploadsSection
                uploads={uploads}
                loading={loading}
                error={dataError}
                stats={stats}
                onRetry={onRetryData}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
