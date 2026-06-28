import type { CSSProperties } from 'react'

// The AquaDucky hero: the hand-drawn rubber-duck artwork (public/aquaducky-hero.svg)
// with a live water level layered on top. The artwork is a flat raster, so the
// glass water can't be toggled directly; instead we keep the lovely painted water
// as the "full" state and animate DRAINING by masking the region above the water
// line with an empty-glass tint. One moving layer, clipped to the glass interior.
//
//  - fill       1 = full glass, 0 = empty (matches cupFill: drains as water is logged)
//  - goalDone   true once the day's goal is reached (duck dons sunglasses + winks)
//  - sipping    pulse true briefly on each sip for a gentle bob
//
// All overlay coordinates live in the artwork's 940.5 viewBox, measured from the
// glass in aquaducky-hero.svg.
const VB = 940.5

// Glass interior (where water sits), measured from the artwork.
const GLASS = { top: 470, bottom: 750 }
const EASE = 'transform .6s cubic-bezier(.45,.9,.3,1)'

export function HeroDucky({
  fill,
  goalDone = false,
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
  const f = Math.max(0, Math.min(1, fill))
  // Water line: f=1 → rim (full), f=0 → bottom (empty).
  const waterY = GLASS.bottom - f * (GLASS.bottom - GLASS.top)

  // The empty-glass mask is a tall rect anchored well above the glass; we slide it
  // down so its bottom edge rests on the water line, hiding the painted water above.
  const maskTop = -120
  const maskH = GLASS.bottom + 240
  const maskShift = waterY - (maskTop + maskH)

  return (
    <div
      className={sipping ? 'hero-sip' : undefined}
      style={{ position: 'relative', width, height: width, willChange: 'transform', ...style }}
    >
      <img
        src="/aquaducky-hero.svg"
        alt="AquaDucky"
        draggable={false}
        style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
      />

      {/* water-fill + celebration overlay, mapped 1:1 onto the artwork */}
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
      >
        <defs>
          {/* glass interior, inset a touch so the drawn glass outline keeps showing */}
          <clipPath id="hdGlass">
            <path d="M533 466 H716 L709 740 q-2 11 -13 11 H551 q-11 0 -13 -11 Z" />
          </clipPath>
          <linearGradient id="hdEmpty" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f0eb" />
            <stop offset="1" stopColor="#e7edf0" />
          </linearGradient>
        </defs>

        <g clipPath="url(#hdGlass)">
          {/* empty-glass tint covering everything above the water line */}
          <g style={{ transform: `translateY(${maskShift}px)`, transition: EASE }}>
            <rect x="515" y={maskTop} width="220" height={maskH} fill="url(#hdEmpty)" fillOpacity="0.94" />
          </g>
          {/* wavy surface highlight riding the water line */}
          <g style={{ transform: `translateY(${waterY}px)`, transition: EASE }}>
            <path
              d="M520 5 Q545 -4 570 5 T620 5 T672 5 T735 5"
              fill="none"
              stroke="#bfe2ff"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.9"
            />
            <rect x="515" y="3" width="220" height="6" fill="#d7f0ff" opacity="0.45" />
          </g>
        </g>

        {/* goal celebration: sunglasses drop onto the duck (echoes the "😎" toast) */}
        {goalDone && (
          <g className="hd-shades" style={{ transformBox: 'view-box', transformOrigin: '498px 295px' }}>
            <g transform="rotate(-9 498 295)">
              {/* bridge */}
              <path d="M458 296 q20 -10 42 -8" fill="none" stroke="#23303f" strokeWidth="9" strokeLinecap="round" />
              {/* arm to the head */}
              <path d="M598 290 q24 -4 40 10" fill="none" stroke="#23303f" strokeWidth="9" strokeLinecap="round" />
              {/* lenses */}
              <rect x="372" y="270" width="92" height="74" rx="26" fill="#222d3a" stroke="#10161f" strokeWidth="3" />
              <rect x="500" y="262" width="92" height="72" rx="26" fill="#222d3a" stroke="#10161f" strokeWidth="3" />
              {/* glints */}
              <path d="M390 300 l22 14" stroke="#6fd3ff" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
              <path d="M518 292 l22 14" stroke="#6fd3ff" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
