// A cute rubber duck that rides the top of the water in the glass.
export function FloatingFriend({ width = 34 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.8} viewBox="0 0 40 32" style={{ display: 'block', filter: 'drop-shadow(0 3px 4px rgba(10,40,90,0.35))' }}>
      {/* body */}
      <ellipse cx="18" cy="20" rx="14" ry="8.5" fill="#ffd24a" />
      {/* wing */}
      <path d="M9 19 q8 6 17 1.5 q-7 7 -17 -1.5 Z" fill="#f4b81f" />
      {/* head */}
      <circle cx="30" cy="11.5" r="6.6" fill="#ffd866" />
      {/* beak */}
      <path d="M35 9.8 l6.5 1.8 -6.5 2.6 Z" fill="#ff9d2e" />
      {/* eye */}
      <circle cx="31.4" cy="10.2" r="1.35" fill="#28304a" />
      <circle cx="31.85" cy="9.75" r="0.45" fill="#fff" />
    </svg>
  )
}
