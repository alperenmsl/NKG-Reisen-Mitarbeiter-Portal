import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Database, Gift, Home, LogOut, Settings, UserRound } from "lucide-react"

type Props = {
  active: "home" | "raffles" | "data" | "profile" | "settings"
  onLogout: () => void
}

function Item(props: {
  icon: React.ReactNode
  label: string
  active?: boolean
  to?: string
  onClick?: () => void
}) {
  const className = cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ease-out"
  )

  const inner = (activeClass: boolean) => (
    <>
      <div className={cn("text-slate-500 transition", activeClass && "text-[#a19a97]")}>{props.icon}</div>
      <div className="truncate">{props.label}</div>
    </>
  )

  if (props.to) {
    return (
      <Link
        to={props.to}
        onClick={props.onClick}
        className={cn(
          className,
          props.active
            ? "bg-[#a19a97]/16 text-slate-900 shadow-[inset_0_0_0_1px_rgba(161,154,151,0.28)]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]"
        )}
      >
        {inner(Boolean(props.active))}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        className,
        props.active
          ? "bg-[#a19a97]/16 text-slate-900 shadow-[inset_0_0_0_1px_rgba(161,154,151,0.28)]"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]"
      )}
    >
      {inner(Boolean(props.active))}
    </button>
  )
}

export default function AppSidebar(props: Props) {
  const location = useLocation()
  function isActive(key: Props["active"]) {
    if (key === "home") return location.pathname.startsWith("/app") && !location.pathname.startsWith("/app/daten")
    if (key === "data") return location.pathname.startsWith("/app/daten")
    return props.active === key
  }

  return (
    <aside className="hidden w-[320px] shrink-0 p-6 lg:block">
      <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-3xl border border-slate-200/60 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur-xl">
        <div className="px-2 pt-2">
          <div className="text-[12px] font-semibold tracking-[0.2em] text-slate-500">NKG REISEN</div>
          <div className="mt-2 text-[16px] font-semibold text-slate-900">Mitarbeiter Portal</div>
        </div>

        <div className="mt-7 flex flex-col gap-1.5">
          <Item to="/app" icon={<Home className="h-4 w-4" />} label="Home" active={isActive("home")} />
          <Item to="/app/daten" icon={<Database className="h-4 w-4" />} label="Daten" active={isActive("data")} />
          <Item icon={<Gift className="h-4 w-4" />} label="Gewinnspiele" active={isActive("raffles")} />
          <Item icon={<UserRound className="h-4 w-4" />} label="Profil" active={isActive("profile")} />
          <Item icon={<Settings className="h-4 w-4" />} label="Einstellungen" active={isActive("settings")} />
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={props.onLogout}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5",
              "text-[13px] font-semibold text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-white hover:shadow-md active:translate-y-[0px]"
            )}
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </div>
    </aside>
  )
}
