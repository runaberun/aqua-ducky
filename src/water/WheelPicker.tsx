import { useEffect, useRef } from 'react'
import { DISPLAY, C } from './style'

export interface WheelOption {
  value: number
  label: string
}

// Vertical scrolling wheel (iOS-style). Pass `values` (+ `unit`) for a simple
// numeric wheel, or `items` for arbitrary labels (dates, times, …).
export function WheelPicker({
  values,
  items,
  value,
  onChange,
  unit = 'oz',
  item = 40,
  visible = 5,
  bg = C.cardWarm,
}: {
  values?: number[]
  items?: WheelOption[]
  value: number
  onChange: (n: number) => void
  unit?: string
  item?: number
  visible?: number
  bg?: string
}) {
  const opts: WheelOption[] = items ?? (values ?? []).map((v) => ({ value: v, label: `${v} ${unit}` }))
  const ITEM = item
  const VISIBLE = visible
  const ref = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const pad = ITEM * ((VISIBLE - 1) / 2)

  // position to the current value on mount
  useEffect(() => {
    const i = Math.max(0, opts.findIndex((o) => o.value === value))
    if (ref.current) ref.current.scrollTop = i * ITEM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const i = Math.max(0, Math.min(opts.length - 1, Math.round(el.scrollTop / ITEM)))
      if (opts[i] && opts[i].value !== value) onChange(opts[i].value)
    })
  }

  return (
    <div style={{ position: 'relative', height: ITEM * VISIBLE }}>
      {/* selected band */}
      <div style={{ position: 'absolute', top: ITEM * ((VISIBLE - 1) / 2), left: 0, right: 0, height: ITEM, borderRadius: 12, border: '1px solid rgba(47,143,214,0.5)', background: 'rgba(47,143,214,0.1)', pointerEvents: 'none', zIndex: 1 }} />
      {/* top/bottom fade */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: `linear-gradient(180deg, ${bg} 2%, transparent 30%, transparent 70%, ${bg} 98%)` }} />
      <div
        ref={ref}
        onScroll={handleScroll}
        style={{ height: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 0 }}
      >
        <div style={{ height: pad }} />
        {opts.map((o) => {
          const sel = o.value === value
          return (
            <div
              key={o.value}
              onClick={() => ref.current?.scrollTo({ top: opts.findIndex((x) => x.value === o.value) * ITEM, behavior: 'smooth' })}
              style={{
                height: ITEM,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                cursor: 'pointer',
                fontFamily: DISPLAY,
                fontVariantNumeric: 'tabular-nums',
                fontSize: sel ? Math.round(ITEM * 0.5) : Math.round(ITEM * 0.38),
                color: sel ? C.ink : 'rgba(23,58,94,0.4)',
                transition: 'font-size .12s ease, color .12s ease',
                whiteSpace: 'nowrap',
                padding: '0 6px',
              }}
            >
              {o.label}
            </div>
          )
        })}
        <div style={{ height: pad }} />
      </div>
    </div>
  )
}
