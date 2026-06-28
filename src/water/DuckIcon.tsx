// A rubber-duck prize ribbon, used as the award icon.
// `color` tints the rosette/ribbon; the duck sits in the medallion.
export function DuckIcon({ size = 28, color = '#f3d28a' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      {/* ribbon tails */}
      <path d="M9 13 L7.4 22 L10.4 19.4 L12 21.6 L13.6 19.4 L16.6 22 L15 13 Z" fill={color} fillOpacity="0.85" />
      {/* rosette medallion */}
      <circle cx="12" cy="9" r="7.2" fill={color} />
      <circle cx="12" cy="9" r="7.2" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.6" />
      <circle cx="12" cy="9" r="5.1" fill="#0e2a52" />
      {/* duck in the medallion */}
      <ellipse cx="11" cy="10.4" rx="3.1" ry="2.1" fill={color} />
      <circle cx="13.4" cy="8.4" r="1.7" fill={color} />
      <path d="M14.8 7.9 L17 8.5 L14.8 9.2 Z" fill="#ff9d2e" />
      <circle cx="13.7" cy="8" r="0.42" fill="#0e2a52" />
    </svg>
  )
}
