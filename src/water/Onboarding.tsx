import { useState } from 'react'
import { DISPLAY, C } from './style'
import { Droplet } from './Droplet'
import { WheelPicker } from './WheelPicker'
import type { DropConfig } from './useWaterApp'

const GOAL_VALUES = Array.from({ length: 185 }, (_, i) => i + 16) // 16..200
const DROP_VALUES = Array.from({ length: 48 }, (_, i) => i + 1) // 1..48

const sectionLabel: React.CSSProperties = { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700 }

export function Onboarding({ onDone }: { onDone: (goal: number, drops: DropConfig[]) => void }) {
  const [goal, setGoal] = useState(80)
  const [drops, setDrops] = useState<DropConfig[]>([{ oz: 8 }, { oz: 16 }, { oz: 0, custom: true }])

  const editDrop = (i: number, fn: (d: DropConfig) => DropConfig) => setDrops((ds) => ds.map((d, j) => (j === i ? fn(d) : d)))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        overflowY: 'auto',
        background: C.paperGrad,
        padding: '64px 24px 36px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <Droplet size={42} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: C.ink, textAlign: 'center' }}>Let’s set you up</div>
      <div style={{ fontSize: 13.5, color: C.ink2, textAlign: 'center', marginTop: 4, lineHeight: 1.4, fontWeight: 600 }}>
        Scroll to pick a daily goal and your three quick-add sizes. Change them anytime in settings.
      </div>

      {/* daily goal — wheel */}
      <div style={{ ...sectionLabel, margin: '22px 0 6px', textAlign: 'center' }}>Daily goal</div>
      <WheelPicker values={GOAL_VALUES} value={goal} onChange={setGoal} item={44} visible={5} bg={C.paper} />
      <div style={{ fontSize: 12, color: C.mute, marginTop: 4, textAlign: 'center', fontWeight: 600 }}>≈ {Math.round(goal / 8)} glasses a day</div>

      {/* quick-add sizes — wheels */}
      <div style={{ ...sectionLabel, margin: '22px 0 10px' }}>Your 3 quick-add sizes</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {drops.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderRadius: 18, background: C.card, border: `1px solid ${C.border}`, boxShadow: C.cardShadow }}>
            <Droplet size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {d.custom ? (
                <div style={{ fontSize: 15, color: C.ink, textAlign: 'center', padding: '20px 0', fontWeight: 600 }}>Custom <span style={{ fontSize: 12, color: C.mute }}>· ask each time</span></div>
              ) : (
                <WheelPicker values={DROP_VALUES} value={d.oz} onChange={(n) => editDrop(i, () => ({ oz: n }))} item={30} visible={3} bg={C.card} />
              )}
            </div>
            <button
              className="press-soft"
              onClick={() => editDrop(i, (x) => (x.custom ? { oz: 8 } : { oz: 0, custom: true }))}
              style={{
                flex: 'none',
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: d.custom ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`,
                background: d.custom ? 'rgba(47,143,214,0.12)' : 'rgba(23,58,94,0.04)',
                color: d.custom ? C.blue : C.ink2,
              }}
            >
              Custom
            </button>
          </div>
        ))}
      </div>

      <button
        className="press-soft"
        onClick={() => onDone(goal, drops)}
        style={{ width: '100%', marginTop: 22, padding: 16, borderRadius: 999, border: 'none', cursor: 'pointer', background: C.blueGrad, color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 12px 28px rgba(47,143,214,0.32), inset 0 1px 0 rgba(255,255,255,0.35)' }}
      >
        Start tracking
      </button>
    </div>
  )
}
