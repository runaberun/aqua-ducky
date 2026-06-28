import type { CSSProperties } from 'react'

// The AquaDucky scene, recreated as vector art (the logo, minus the wordmark):
// a rubber duck sipping water through a straw from a glass. The glass starts
// FULL at the day's goal and drains as water is logged; at the goal the duck
// is empty-cup and dons sunglasses (with a wink) to celebrate.
//
//  - fill       1 = full glass, 0 = empty
//  - goalDone   true once the day's goal is reached (sunglasses on + wink)
//  - sipping    pulse true briefly on each sip for a little head-dip
//
// Geometry lives in a 240×240 viewBox; the water is one rect that slides down
// inside a clip of the glass interior, so the level animates smoothly via CSS.
const CUP_TOP = 130
const CUP_BOT = 212
const CUP_H = CUP_BOT - CUP_TOP

export function DuckCup({
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
  const drop = (1 - f) * CUP_H // how far the water has sunk

  return (
    <svg width={width} height={width} viewBox="0 0 240 240" style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id="dcBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE07A" />
          <stop offset="1" stopColor="#FFC22E" />
        </linearGradient>
        <linearGradient id="dcWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CC6FF" />
          <stop offset="1" stopColor="#2F7FD0" />
        </linearGradient>
        <clipPath id="dcCup">
          <path d="M154 133 H214 L208 204 q-1 7 -8 7 H162 q-7 0 -8 -7 Z" />
        </clipPath>
      </defs>

      {/* base water ripples */}
      <g stroke="#7FB8E8" fill="none" strokeLinecap="round" opacity="0.85">
        <ellipse cx="118" cy="216" rx="98" ry="16" strokeWidth="3" />
        <ellipse cx="118" cy="216" rx="66" ry="10" strokeWidth="2.4" opacity="0.7" />
      </g>
      {/* splash droplets */}
      <g fill="#5fa8e6">
        <path d="M22 150 q4 -9 8 0 a4.4 4.4 0 0 1 -8 0Z" />
        <path d="M223 158 q4 -9 8 0 a4.4 4.4 0 0 1 -8 0Z" />
        <path d="M14 176 q3 -7 6 0 a3.3 3.3 0 0 1 -6 0Z" />
      </g>

      {/* ---- DUCK ---- */}
      <path d="M40 150 q-16 -4 -24 -14 q16 -4 30 4 Z" fill="#FFC22E" stroke="#E89B16" strokeWidth="2" />
      <ellipse cx="86" cy="158" rx="62" ry="53" fill="url(#dcBody)" stroke="#E89B16" strokeWidth="2.4" />

      {/* head + face — dips slightly on each sip */}
      <g className={sipping ? 'dc-sip' : undefined} style={{ transformBox: 'fill-box', transformOrigin: '74% 86%' }}>
        <circle cx="98" cy="90" r="40" fill="url(#dcBody)" stroke="#E89B16" strokeWidth="2.4" />
        <ellipse cx="86" cy="112" rx="10" ry="6.5" fill="#FFB199" opacity="0.5" />
        {/* beak */}
        <path d="M126 96 q30 -7 40 4 q-10 9 -27 8 q-12 -1 -13 -12Z" fill="#FF9E2D" stroke="#E07A14" strokeWidth="2" />
        <path d="M133 110 q14 5 27 1 q-9 8 -22 6 q-6 -2 -5 -7Z" fill="#E8761A" />

        {goalDone ? (
          <>
            {/* eye underneath winks while the shades dip */}
            <g className="dc-wink">
              <circle cx="104" cy="82" r="15" fill="#fff" />
              <circle cx="107" cy="84" r="10.5" fill="#1f2733" />
              <circle cx="110.5" cy="80.5" r="3.2" fill="#fff" />
            </g>
            <path className="dc-winkline" d="M92 84 q12 7 24 0" fill="none" stroke="#2a2a2a" strokeWidth="3.4" strokeLinecap="round" />
            {/* sunglasses drop on, dip, and settle */}
            <g className="dc-shades">
              <path d="M76 73 q14 -6 28 0" fill="none" stroke="#23303f" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="77" y="74" width="29" height="22" rx="9" fill="#222d3a" />
              <rect x="108" y="74" width="25" height="22" rx="9" fill="#222d3a" />
              <rect x="105" y="80" width="6" height="4" rx="2" fill="#222d3a" />
              <path d="M82 80 l9 5" stroke="#6fd3ff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
            </g>
          </>
        ) : (
          <>
            <path d="M90 64 q14 -9 28 -1" fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="104" cy="82" r="15" fill="#fff" />
            <circle cx="107" cy="84" r="10.5" fill="#1f2733" />
            <circle cx="110.5" cy="80.5" r="3.2" fill="#fff" />
          </>
        )}
      </g>

      {/* wing */}
      <path d="M58 152 q34 16 74 0 q-20 32 -58 20 q-16 -6 -16 -20Z" fill="#FFB81F" stroke="#E89B16" strokeWidth="2" />

      {/* straw */}
      <g strokeLinecap="round" fill="none">
        <path d="M150 100 q8 -6 14 -2 l20 36" stroke="#2F7FD0" strokeWidth="9" />
        <path d="M150 100 q8 -6 14 -2 l20 36" stroke="#bfe2ff" strokeWidth="3" strokeDasharray="2 10" />
      </g>

      {/* ---- CUP ---- */}
      <g clipPath="url(#dcCup)">
        <g style={{ transform: `translateY(${drop}px)`, transition: 'transform .6s cubic-bezier(.45,.9,.3,1)' }}>
          <rect x="150" y={CUP_TOP} width="70" height={CUP_H + 34} fill="url(#dcWater)" />
          {/* wavy surface riding the top of the water */}
          <svg x="150" y={CUP_TOP - 7} width="70" height="14" viewBox="0 0 70 14" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <path d="M0 8 Q9 2 18 8 T36 8 T54 8 T72 8 V14 H0Z" fill="#8fd0ff" style={{ animation: 'wv1 6s linear infinite' }} />
          </svg>
          <g fill="#cdeaff" opacity="0.7">
            <circle cx="172" cy={CUP_BOT - 20} r="3" />
            <circle cx="196" cy={CUP_BOT - 38} r="2.3" />
            <circle cx="184" cy={CUP_BOT - 12} r="2" />
          </g>
        </g>
      </g>
      {/* glass outline + glints */}
      <path d="M154 133 H214 L208 204 q-1 7 -8 7 H162 q-7 0 -8 -7 Z" fill="rgba(255,255,255,0.14)" stroke="#9ec8ec" strokeWidth="2.4" />
      <path d="M161 138 l3 64" stroke="#fff" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
      {/* wing-tip cupped around the glass */}
      <path d="M150 196 q10 10 24 9 q-8 9 -22 4 q-6 -5 -2 -13Z" fill="#FFB81F" stroke="#E89B16" strokeWidth="2" />
    </svg>
  )
}
