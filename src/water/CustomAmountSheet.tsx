import { useState } from 'react'
import { DISPLAY, C } from './style'
import { WheelPicker } from './WheelPicker'
import { CloseButton } from './CloseButton'

const OZ_VALUES = Array.from({ length: 48 }, (_, i) => i + 1)

// Log a one-off custom amount (at the current time).
export function CustomAmountSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (oz: number) => void }) {
  const [oz, setOz] = useState(12)

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
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700 }}>One-off amount</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: C.ink, marginTop: 2 }}>Custom drink</div>

        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700, margin: '18px 0 6px' }}>Scroll to choose</div>
        <WheelPicker values={OZ_VALUES} value={oz} onChange={setOz} />

        <button
          className="press-soft"
          onClick={() => onAdd(oz)}
          style={{ width: '100%', marginTop: 18, padding: 16, borderRadius: 999, border: 'none', cursor: 'pointer', background: C.blueGrad, color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 12px 28px rgba(47,143,214,0.32), inset 0 1px 0 rgba(255,255,255,0.35)' }}
        >
          Pour {oz} oz
        </button>
        <button
          className="press-soft"
          onClick={onClose}
          style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 999, border: `1px solid ${C.border}`, cursor: 'pointer', background: 'transparent', color: C.ink2, fontSize: 13, fontWeight: 600 }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}
