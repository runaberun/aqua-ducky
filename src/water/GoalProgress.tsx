import type { CSSProperties } from 'react'
import { C, DISPLAY } from './style'

// Horizontal "race to the goal" bar shown under the hero duck. A little duck
// travels left -> right based on how much of the goal has been drunk and
// crosses a checkered finish line at 100%, where a confetti burst fires.

function DuckMarker() {
  return (
    <svg width="36" height="30" viewBox="0 0 44 36" style={{ display: 'block', filter: 'drop-shadow(0 2px 2px rgba(120,104,72,0.25))' }}>
      {/* tail */}
      <path d="M7 22 q-5 -1 -8 -5 q5 -2 11 1 Z" fill="#f5a623" stroke="#c9790a" strokeWidth="1.4" />
      {/* body */}
      <ellipse cx="21" cy="23" rx="15" ry="10" fill="#ffc22e" stroke="#c9790a" strokeWidth="1.6" />
      {/* wing */}
      <path d="M12 21 q9 6 20 1" fill="none" stroke="#c9790a" strokeWidth="1.1" opacity="0.5" />
      {/* head */}
      <circle cx="32" cy="13" r="7.6" fill="#ffc22e" stroke="#c9790a" strokeWidth="1.6" />
      {/* beak (facing right, toward the finish) */}
      <path d="M39 11.5 q6 -1 8 2.2 q-3 3 -8 1.8 Z" fill="#f3902b" stroke="#c9790a" strokeWidth="1.2" />
      {/* eye */}
      <circle cx="33" cy="11.4" r="1.7" fill="#1f2733" />
    </svg>
  )
}

const CONFETTI_COLORS = ['#2f8fd6', '#f5a623', '#1f9e85', '#ff5c87', '#7cc6ff', '#ffd979']

function Confetti() {
  const N = 20
  return (
    <div style={{ position: 'absolute', right: 2, bottom: 8, width: 0, height: 0, pointerEvents: 'none', zIndex: 3 }}>
      {Array.from({ length: N }, (_, i) => {
        const dx = ((i * 53) % 110) - 78 // mostly leftward/over the bar
        const dy = -(22 + ((i * 37) % 66)) // upward burst
        const rot = ((i * 97) % 720) - 360
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
        const style = {
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: i % 2 ? 5 : 7,
          height: i % 2 ? 8 : 5,
          background: color,
          borderRadius: 1,
          '--cx': `${dx}px`,
          '--cy': `${dy}px`,
          '--cr': `${rot}deg`,
          animation: `confettiPop ${0.9 + (i % 5) * 0.09}s cubic-bezier(.25,.7,.4,1) ${(i % 6) * 0.04}s both`,
        } as CSSProperties
        return <span key={i} style={style} />
      })}
    </div>
  )
}

export function GoalProgress({ consumed, goal, celebrate }: { consumed: number; goal: number; celebrate: boolean }) {
  const p = goal > 0 ? Math.max(0, Math.min(1, consumed / goal)) : 0
  const ease = 'left .6s cubic-bezier(.45,.9,.3,1), width .6s cubic-bezier(.45,.9,.3,1)'

  return (
    <div style={{ width: '100%', maxWidth: 340, marginTop: 8 }}>
      {/* lane — inset so the duck and finish line sit fully inside */}
      <div style={{ position: 'relative', height: 46, margin: '0 18px' }}>
        {celebrate && <Confetti />}

        {/* track + fill */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 9, height: 9, borderRadius: 999, background: 'rgba(23,58,94,0.12)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: C.blueGrad, borderRadius: 999, transition: ease }} />
        </div>

        {/* checkered finish line at the right end */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: -3,
            bottom: 2,
            width: 12,
            height: 25,
            borderRadius: 2,
            backgroundImage: 'repeating-conic-gradient(#2a3340 0% 25%, #ffffff 0% 50%)',
            backgroundSize: '6px 6px',
            boxShadow: '0 1px 3px rgba(23,58,94,0.25)',
          }}
        />

        {/* the travelling duck */}
        <div style={{ position: 'absolute', bottom: 5, left: `${p * 100}%`, transform: 'translateX(-50%)', transition: ease, zIndex: 2 }}>
          <DuckMarker />
        </div>
      </div>

      {/* consumed so far (left) and the goal at the finish (right) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4, padding: '0 2px' }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: C.ink2, fontVariantNumeric: 'tabular-nums' }}>{consumed} oz</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>🏁 {goal} oz</span>
      </div>
    </div>
  )
}
