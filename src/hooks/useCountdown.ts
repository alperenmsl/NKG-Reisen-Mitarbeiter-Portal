import { useEffect, useMemo, useState } from "react"

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
}

function clampNonNegative(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

function splitMs(ms: number): CountdownParts {
  const totalMs = clampNonNegative(ms)
  const totalSeconds = Math.floor(totalMs / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, totalMs }
}

export function useCountdown(target: Date): CountdownParts {
  const targetMs = useMemo(() => target.getTime(), [target])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return splitMs(targetMs - now)
}

