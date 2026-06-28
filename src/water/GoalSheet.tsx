import type { WaterView } from './useWaterApp'
import { DISPLAY, C } from './style'
import { NumberField } from './NumberField'
import { CloseButton } from './CloseButton'

interface Props {
  view: WaterView
  onClose: () => void
  onSave: () => void
  onInc: () => void
  onDec: () => void
  onReset: () => void
  onEditGoal: (n: number) => void
  onIncDrop: (i: number) => void
  onDecDrop: (i: number) => void
  onEditDropOz: (i: number, n: number) => void
  onToggleCustom: (i: number) => void
}

const miniStep: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: '50%',
  border: `1px solid ${C.border}`,
  background: 'rgba(23,58,94,0.05)',
  color: C.ink,
  fontSize: 19,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
}

const bigStep: React.CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: '50%',
  border: `1px solid ${C.border}`,
  background: 'rgba(23,58,94,0.05)',
  color: C.ink,
  fontSize: 26,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const sectionLabel: React.CSSProperties = { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700 }

export function GoalSheet({ view: v, onClose, onSave, onInc, onDec, onReset, onEditGoal, onIncDrop, onDecDrop, onEditDropOz, onToggleCustom }: Props) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 30, background: C.scrim }} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 31,
          maxHeight: '90%',
          overflowY: 'auto',
          background: 'linear-gradient(180deg,#fdfbf6,#f4efe4)',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTop: `1px solid ${C.border}`,
          padding: '12px 24px 40px',
          boxShadow: '0 -24px 60px rgba(70,60,40,0.22)',
        }}
      >
        <CloseButton onClick={onClose} />
        <div style={{ width: 40, height: 5, borderRadius: 999, background: 'rgba(23,58,94,0.18)', margin: '0 auto 16px' }} />
        <div style={sectionLabel}>Daily goal</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: C.ink, marginTop: 2 }}>Set your intake</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 20 }}>
          <button className="press" onClick={onDec} style={bigStep}>−</button>
          <div style={{ textAlign: 'center', minWidth: 128 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
              <NumberField
                value={v.goalDraftText}
                min={8}
                max={200}
                onChange={onEditGoal}
                width="3ch"
                style={{ fontFamily: DISPLAY, fontSize: 62, fontWeight: 600, color: C.ink, lineHeight: 1 }}
              />
              <span style={{ fontFamily: DISPLAY, fontSize: 20, color: C.ink2 }}>oz</span>
            </div>
            <div style={{ fontSize: 12, color: C.mute, marginTop: 4, fontWeight: 600 }}>≈ {v.goalGlasses} glasses a day · tap to type</div>
          </div>
          <button className="press" onClick={onInc} style={bigStep}>+</button>
        </div>

        <div style={{ ...sectionLabel, margin: '24px 0 8px' }}>Quick-add sizes</div>
        <div style={{ borderRadius: 20, background: C.card, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, overflow: 'hidden' }}>
          {v.dropsDraft.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < v.dropsDraft.length - 1 ? `1px solid ${C.hair}` : 'none' }}>
              <div style={{ flex: 1 }}>
                {d.custom ? (
                  <div style={{ fontSize: 15, color: C.ink, fontWeight: 600 }}>Custom <span style={{ fontSize: 12, color: C.mute }}>· ask each time</span></div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="press" onClick={() => onDecDrop(i)} style={miniStep}>−</button>
                    <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 56, justifyContent: 'center' }}>
                      <NumberField value={d.oz} min={1} max={64} onChange={(n) => onEditDropOz(i, n)} width="2.4ch" style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, color: C.ink }} />
                      <span style={{ fontFamily: DISPLAY, fontSize: 14, color: C.ink2, marginLeft: 3 }}>oz</span>
                    </div>
                    <button className="press" onClick={() => onIncDrop(i)} style={miniStep}>+</button>
                  </div>
                )}
              </div>
              <button
                className="press-soft"
                onClick={() => onToggleCustom(i)}
                style={{
                  flex: 'none',
                  padding: '6px 12px',
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

        <div style={{ ...sectionLabel, margin: '24px 0 8px' }}>Reminders</div>
        <div style={{ borderRadius: 20, background: C.card, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, overflow: 'hidden' }}>
          {v.reminders.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < v.reminders.length - 1 ? `1px solid ${C.hair}` : 'none' }}>
              <div>
                <div style={{ fontSize: 15, color: C.ink, fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: C.mute, fontWeight: 600 }}>{r.time}</div>
              </div>
              <button
                onClick={r.onTap}
                style={{ position: 'relative', width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: r.trackBg, transition: 'background .25s' }}
              >
                <span style={{ position: 'absolute', top: 3, left: r.knobLeft, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(40,40,40,0.25)', transition: 'left .25s cubic-bezier(.3,1.4,.4,1)' }} />
              </button>
            </div>
          ))}
        </div>

        <button
          className="press-soft"
          onClick={onSave}
          style={{
            width: '100%',
            marginTop: 20,
            padding: 16,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: C.blueGrad,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            boxShadow: '0 12px 28px rgba(47,143,214,0.32), inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          Save goal
        </button>
        <button
          className="press-soft"
          onClick={onReset}
          style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 999, border: `1px solid ${C.border}`, cursor: 'pointer', background: 'transparent', color: C.ink2, fontSize: 13, fontWeight: 600 }}
        >
          Reset today's intake
        </button>
      </div>
    </>
  )
}
