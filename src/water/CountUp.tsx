import { useEffect, useRef, useState } from 'react'

// Animated count-up: eases from the previously displayed value to `value`
// whenever it changes (and from 0 on first mount). Renders just the number,
// so the caller controls all styling.
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const displayRef = useRef(0)

  useEffect(() => {
    const from = displayRef.current
    const to = value
    if (from === to) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration))
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const cur = Math.round(from + (to - from) * eased)
      displayRef.current = cur
      setDisplay(cur)
      if (t < 1) raf = requestAnimationFrame(tick)
      else {
        displayRef.current = to
        setDisplay(to)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{display}</>
}
