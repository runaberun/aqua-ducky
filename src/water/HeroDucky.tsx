import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// The AquaDucky hero is a set of hand-drawn images, one per 10% band of the
// daily goal *remaining*. As water is logged the remaining % drops and we swap
// to the matching artwork (the glass fills up as you approach your goal).
//
//   100%        -> ducky-100   (exactly 100% remaining, i.e. nothing logged yet)
//   90-99%      -> ducky-90
//   80-89%      -> ducky-80
//   ...and so on, in 10% bands.
//
// BUCKETS lists the bands we currently have art for. Add 50, 40, 30, 20, 10, 0
// here as the remaining images are dropped into public/hero/. Bands without
// their own image fall back to the closest available one.
const BUCKETS = [100, 90, 80, 70, 60]

function bucketFor(remainingPct: number): number {
  const r = Math.max(0, Math.min(100, remainingPct))
  const band = r >= 100 ? 100 : Math.floor(r / 10) * 10
  if (BUCKETS.includes(band)) return band
  return BUCKETS.reduce((best, b) => (Math.abs(b - band) < Math.abs(best - band) ? b : best), BUCKETS[0])
}

function srcFor(bucket: number): string {
  return `${import.meta.env.BASE_URL}hero/ducky-${bucket}.webp`
}

export function HeroDucky({
  fill,
  // goalDone is accepted for API compatibility; the band artwork already
  // reflects progress, so it isn't used to draw anything extra.
  goalDone: _goalDone = false,
  sipping = false,
  width = 240,
  style,
}: {
  fill: number
  goalDone?: boolean
  sipping?: boolean
  width?: number
  style?: CSSProperties
}) {
  const remainingPct = Math.max(0, Math.min(1, fill)) * 100
  const bucket = bucketFor(remainingPct)
  const src = srcFor(bucket)

  // Crossfade between bands: keep the outgoing image underneath while the new
  // one fades in on top.
  const seq = useRef(0)
  const [layers, setLayers] = useState([{ src, id: 0 }])
  const lastSrc = useRef(src)
  useEffect(() => {
    if (src === lastSrc.current) return
    lastSrc.current = src
    seq.current += 1
    const id = seq.current
    // keep only the previous (now-bottom) layer plus the new top layer
    setLayers((prev) => [...prev.slice(-1), { src, id }])
  }, [src])

  return (
    <div
      className={sipping ? 'hero-sip' : undefined}
      style={{ position: 'relative', width, height: width, willChange: 'transform', ...style }}
    >
      {layers.map((layer, i) => (
        <img
          key={layer.id}
          src={layer.src}
          alt="AquaDucky"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            userSelect: 'none',
            // the topmost (latest) layer fades in; older layer sits beneath
            animation: i === layers.length - 1 && layers.length > 1 ? 'herofade .45s ease both' : undefined,
          }}
        />
      ))}
    </div>
  )
}
