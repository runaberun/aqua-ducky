import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// The AquaDucky hero swaps between hand-drawn images by the % of the daily goal
// *remaining* (= oz left / goal). The artwork file numbers were assigned
// separately and do NOT line up with the band %, so this is an explicit lookup.
//
// band = remaining% rounded UP to the nearest 10 (and 0 is its own band):
//   91-100% -> band 100 -> ducky-60
//   81-90%  -> band 90  -> ducky-70
//   71-80%  -> band 80  -> ducky-80
//   61-70%  -> band 70  -> ducky-90
//   51-60%  -> band 60  -> ducky-100
//   41-50%  -> band 50  -> ducky-10
//   31-40%  -> band 40  -> ducky-20
//   21-30%  -> band 30  -> ducky-30
//   11-20%  -> band 20  -> ducky-40
//   1-10%   -> band 10  -> ducky-50
//   0%      -> band 0   -> ducky-0   (goal reached: shades on)
const BAND_TO_FILE: Record<number, number> = {
  100: 60,
  90: 70,
  80: 80,
  70: 90,
  60: 100,
  50: 10,
  40: 20,
  30: 30,
  20: 40,
  10: 50,
  0: 0,
}

function srcFor(remainingPct: number): string {
  // round away tiny float error (e.g. 64/80*100 = 80.0000001) before bucketing
  const r = Math.max(0, Math.min(100, Math.round(remainingPct * 1e6) / 1e6))
  const band = r <= 0 ? 0 : Math.ceil(r / 10) * 10
  const file = BAND_TO_FILE[band] ?? BAND_TO_FILE[100]
  return `${import.meta.env.BASE_URL}hero/ducky-${file}.webp`
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
  const src = srcFor(remainingPct)

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
            // the topmost (latest) layer springs in over the previous one
            animation: i === layers.length - 1 && layers.length > 1 ? 'heroswap 1.15s cubic-bezier(.34,1.32,.5,1) both' : undefined,
          }}
        />
      ))}
    </div>
  )
}
