import { useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react"
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { loginBackgroundUrl, nkgLogoUrl } from "@/assets/loginImages"
import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { signInWithEmailAndPassword } from "firebase/auth"

type DemoAccount = {
  label: string
  email: string
}

const demoAccounts: DemoAccount[] = [
  { label: "Mitarbeiter", email: "mitarbeiter@nkg-reisen.de" },
  { label: "Admin", email: "admin@nkg-reisen.de" },
]

function InlineIconInput(props: {
  label: string
  type: "email" | "password" | "text"
  value: string
  onChange: (value: string) => void
  placeholder?: string
  leftIcon: ReactNode
  right?: ReactNode
  autoComplete?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold text-slate-800">{props.label}</div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          {props.leftIcon}
        </div>
        <input
          type={props.type}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 text-[14px] text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition",
            "placeholder:text-slate-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a19a97]/35 focus-visible:border-[#a19a97]/60",
            "hover:border-slate-300 hover:bg-white"
          )}
        />
        {props.right ? <div className="absolute inset-y-0 right-3 flex items-center">{props.right}</div> : null}
      </div>
    </label>
  )
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const leftPanelStyle = useMemo<CSSProperties>(() => {
    if (loginBackgroundUrl) {
      return {
        backgroundImage: `url(${loginBackgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    }
    return {
      backgroundImage:
        "linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.78)), radial-gradient(circle at 20% 20%, rgba(161, 154, 151, 0.25), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08), transparent 60%)",
    }
  }, [loginBackgroundUrl])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void (async () => {
      if (!email.trim() || !password.trim()) {
        setError("Bitte E-Mail und Passwort eingeben.")
        return
      }
      if (!firebaseConfigured) {
        setError("Firebase ist noch nicht konfiguriert. Lege eine Web-App an und befülle .env.local (siehe .env.example).")
        return
      }

      try {
        setSubmitting(true)
        setError(null)
        await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
      } catch (err) {
        const code = typeof err === "object" && err && "code" in err ? String((err as { code?: unknown }).code) : ""
        if (
          code === "auth/invalid-credential" ||
          code === "auth/invalid-login-credentials" ||
          code === "auth/user-not-found" ||
          code === "auth/wrong-password" ||
          code === "auth/invalid-password"
        ) {
          setError("E-Mail oder Passwort ist falsch.")
          return
        }
        if (code === "auth/too-many-requests") {
          setError("Zu viele Versuche. Bitte später erneut versuchen.")
          return
        }
        if (code === "auth/invalid-email") {
          setError("Bitte eine gültige E-Mail-Adresse eingeben.")
          return
        }
        setError(code ? `Anmeldung fehlgeschlagen (${code}).` : "Anmeldung fehlgeschlagen. Bitte erneut versuchen.")
      } finally {
        setSubmitting(false)
      }
    })()
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[40%_60%]">
      <section className="relative overflow-hidden lg:min-h-screen" style={leftPanelStyle}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(2,6,23,0.55),transparent_58%)]" />
        <div className="relative flex min-h-[38vh] flex-col px-7 pb-10 pt-10 sm:px-10 sm:pb-12 sm:pt-12 lg:min-h-screen lg:px-14 lg:pb-14 lg:pt-14">
          <div className="flex flex-1 items-center">
            <div className="ml-auto w-full max-w-[28rem] lg:mr-4 lg:-translate-y-16">
              <div className="drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
                <div className="text-[40px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[44px]">
                  Willkommen im
                  <div className="mt-1 text-[#a19a97]">Mitarbeiter Portal</div>
                </div>
              </div>
              <p className="mt-4 max-w-[26rem] text-[13px] leading-relaxed text-white/80 sm:text-[14px]">
                Exklusive Gewinnspiele, Reisevorteile und mehr – alles an einem Ort für das NKG Reisen Team.
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-end justify-between">
            <div className="h-px flex-1 bg-white/10" />
            <div className="ml-6">
              {nkgLogoUrl ? (
                <img src={nkgLogoUrl} alt="NKG" className="h-8 w-auto opacity-95" />
              ) : (
                <div className="select-none text-[28px] font-semibold tracking-[0.18em] text-white/90">NKG</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[62vh] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-5 py-10 sm:px-10 lg:min-h-screen lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(161,154,151,0.16),transparent_55%)]" />

        <div className="relative w-full max-w-[520px]">
          <div className="rounded-3xl border border-slate-200/60 bg-white/85 px-6 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur-xl sm:px-10 sm:py-9">
            <div className="text-[18px] font-semibold text-slate-900">Anmelden</div>
            <div className="mt-1 text-[12px] text-slate-500">Melden Sie sich mit Ihren Zugangsdaten an.</div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <InlineIconInput
                label="E-Mail-Adresse"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v)
                  if (error) setError(null)
                }}
                placeholder="name@nkg-reisen.de"
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-slate-800">Passwort</div>
                  <button
                    type="button"
                    className="text-[12px] font-semibold text-slate-600 underline-offset-4 hover:text-[#0B2C40] hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    autoComplete="current-password"
                    className={cn(
                      "h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-10 text-[14px] text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a19a97]/35 focus-visible:border-[#a19a97]/60",
                      "hover:border-slate-300 hover:bg-white"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2.5 flex items-center rounded-lg px-2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B2C40] px-4 text-[13px] font-semibold text-white shadow-[0_10px_30px_rgba(11,44,64,0.22)] transition",
                  "hover:bg-[#10364D] active:translate-y-[1px] active:shadow-[0_6px_18px_rgba(11,44,64,0.18)]",
                  "disabled:cursor-not-allowed disabled:opacity-70"
                )}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Anmelden
                  </span>
                ) : (
                  <>
                    Anmelden <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {error ? <div className="text-[12px] font-medium text-rose-600">{error}</div> : null}
            </form>
          </div>

          <div className="mt-8">
            <div className="text-center text-[11px] font-semibold tracking-[0.2em] text-slate-400">
              DEMO-ZUGANGSDATEN
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => setEmail(acc.email)}
                  className={cn(
                    "group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition",
                    "hover:-translate-y-[1px] hover:shadow-md"
                  )}
                >
                  <div className="text-[12px] font-semibold text-slate-900">{acc.label}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500 group-hover:text-slate-600">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
