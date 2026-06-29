import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { FEATHER } from './style'

// The AquaDucky hero is a set of hand-drawn images, one per 10% band of the
// daily goal *remaining*. As water is logged the remaining % drops and we swap
// to the matching artwork.
//
//   91-100%  -> ducky-100
//   81-90%   -> ducky-90
//   71-80%   -> ducky-80
//   ...each band is the top of a 10-point range...
//   1-10%    -> ducky-10
//   0%       -> ducky-0     (goal reached: the duck kicks back with shades on)
//
// i.e. round the remaining % UP to the nearest 10 (and 0 is its own band).
// BUCKETS lists the bands we have art for; any gap falls back to the closest.
const BUCKETS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]

function bucketFor(remainingPct: number): number {
  // round away tiny float error (e.g. 64/80*100 = 80.0000001) before bucketing
  const r = Math.max(0, Math.min(100, Math.round(remainingPct * 1e6) / 1e6))
  const band = r <= 0 ? 0 : Math.ceil(r / 10) * 10
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
            ...FEATHER,
            // the topmost (latest) layer springs in over the previous one
            animation: i === layers.length - 1 && layers.length > 1 ? 'heroswap 1.15s cubic-bezier(.34,1.32,.5,1) both' : undefined,
          }}
        />
      ))}
    </div>
  )
}
