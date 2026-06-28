// New water-drop style: an upright SVG droplet with a soft gradient + glint,
// replacing the old CSS rotated-square teardrop.
import type { CSSProperties } from 'react'

export function DropGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="dropGrad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#eaf6ff" />
          <stop offset="40%" stopColor="#86c4ff" />
          <stop offset="100%" stopColor="#2f6fd6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Droplet({ size, style }: { size: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', ...style }}>
      <path
        d="M12 2.2C12 2.2 19 10.4 19 15.4A7 7 0 0 1 5 15.4C5 10.4 12 2.2 12 2.2Z"
        fill="url(#dropGrad)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.7"
      />
    </svg>
  )
}
