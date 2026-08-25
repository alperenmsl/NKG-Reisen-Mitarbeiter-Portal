import { cn } from "@/lib/utils"

type Props = {
  days: number
  hours: number
  minutes: number
  seconds?: number
  title?: string
  subtitle?: string
}

function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, "0")
}

function pad3(n: number): string {
  return String(Math.floor(n)).padStart(3, "0")
}

function Segment(props: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-stretch gap-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 px-5 py-4",
          "shadow-[0_18px_50px_rgba(15,23,42,0.10)] ring-1 ring-black/5 backdrop-blur-xl",
          "transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-slate-200/90 hover:bg-white hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)]"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(161,154,151,0.18),transparent_55%)]",
            props.accent && "bg-[radial-gradient(circle_at_30%_20%,rgba(161,154,151,0.26),transparent_55%)]"
          )}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.65),transparent_40%,rgba(15,23,42,0.04))]" />
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-200/80" />
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              "font-mono text-[46px] font-semibold leading-none tracking-[0.12em] text-[#0B2C40]"
            )}
          >
            {props.value}
          </div>
        </div>
        <div className="relative mt-3 h-[8px] w-full overflow-hidden rounded-full bg-slate-200/70">
          <div
            className={cn(
              "absolute inset-0 bg-[linear-gradient(90deg,rgba(161,154,151,0.30),rgba(11,44,64,0.10),rgba(161,154,151,0.25))]",
              props.accent && "bg-[linear-gradient(90deg,rgba(161,154,151,0.55),rgba(11,44,64,0.12),rgba(161,154,151,0.45))]"
            )}
          />
        </div>
        <div className={cn("relative mt-2 text-center text-[11px] font-semibold tracking-[0.24em] text-slate-500", props.accent && "text-[#a19a97]")}>
          {props.label}
        </div>
      </div>
    </div>
  )
}

export default function DigitalCountdown(props: Props) {
  const showSeconds = typeof props.seconds === "number"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200/60 bg-white/85 p-6",
        "shadow-[0_18px_50px_rgba(15,23,42,0.12)] ring-1 ring-black/5 backdrop-blur-xl"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(161,154,151,0.16),transparent_55%)]" />

      <div className="relative flex flex-col gap-6">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.26em] text-slate-500">{props.title ?? "GEWINNSPIEL"}</div>
          <div className="mt-2 text-[22px] font-semibold text-slate-900">Countdown</div>
          {props.subtitle ? <div className="mt-1 text-[13px] text-slate-600">{props.subtitle}</div> : null}
        </div>

        <div className={cn("grid gap-4", showSeconds ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3")}>
          <Segment label="TAGE" value={pad3(props.days)} accent />
          <Segment label="STUNDEN" value={pad2(props.hours)} />
          <Segment label="MINUTEN" value={pad2(props.minutes)} />
          {showSeconds ? <Segment label="SEKUNDEN" value={pad2(props.seconds ?? 0)} /> : null}
        </div>
      </div>
    </div>
  )
}
