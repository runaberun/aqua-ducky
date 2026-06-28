import { useMemo, useState } from 'react'
import { DISPLAY, C } from './style'
import { WheelPicker, type WheelOption } from './WheelPicker'
import { CloseButton } from './CloseButton'

const OZ_VALUES = Array.from({ length: 48 }, (_, i) => i + 1)
const N_DAYS = 90
const N_TIMES = 96 // 15-minute steps across a day

function midnight(d: Date) {
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t
}
function fmtTimeIdx(idx: number) {
  const total = idx * 15
  let h = Math.floor(total / 60)
  const m = total % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  let hh = h % 12
  if (hh === 0) hh = 12
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`
}

export function AddEntrySheet({ onClose, onAdd, presetDate }: { onClose: () => void; onAdd: (oz: number, ts: number) => void; presetDate?: string | null }) {
  const today = midnight(new Date())

  // date options: 0 = today, 1 = yesterday, … going back N_DAYS
  const dateOptions: WheelOption[] = useMemo(() => {
    return Array.from({ length: N_DAYS }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      return { value: i, label }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const timeOptions: WheelOption[] = useMemo(() => Array.from({ length: N_TIMES }, (_, i) => ({ value: i, label: fmtTimeIdx(i) })), [])

  // initial selection
  const presetDaysAgo = (() => {
    if (!presetDate) return 0
    const p = midnight(new Date(presetDate + 'T00:00'))
    const diff = Math.round((today.getTime() - p.getTime()) / 86400000)
    return diff >= 0 && diff < N_DAYS ? diff : 0
  })()
  const nowIdx = Math.min(N_TIMES - 1, Math.round((new Date().getHours() * 60 + new Date().getMinutes()) / 15))

  const [oz, setOz] = useState(12)
  const [dayIdx, setDayIdx] = useState(presetDaysAgo)
  const [timeIdx, setTimeIdx] = useState(nowIdx)

  const ts = (() => {
    const d = new Date(today)
    d.setDate(d.getDate() - dayIdx)
    d.setHours(Math.floor((timeIdx * 15) / 60), (timeIdx * 15) % 60, 0, 0)
    return d.getTime()
  })()
  const valid = ts <= Date.now() + 60 * 1000

  const sheetStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 31,
    maxHeight: '92%',
    overflowY: 'auto',
    background: 'linear-gradient(180deg,#fdfbf6,#f4efe4)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTop: `1px solid ${C.border}`,
    padding: '12px 24px 40px',
    boxShadow: '0 -24px 60px rgba(70,60,40,0.22)',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 30, background: C.scrim }} />
      <div style={sheetStyle}>
        <CloseButton onClick={onClose} />
        <div style={{ width: 40, height: 5, borderRadius: 999, background: 'rgba(23,58,94,0.18)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700 }}>Forgot to record?</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 600, color: C.ink, marginTop: 2 }}>Add past entry</div>

        {/* amount */}
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700, margin: '18px 0 4px' }}>Amount</div>
        <WheelPicker values={OZ_VALUES} value={oz} onChange={setOz} item={38} />

        {/* when — date + time wheels, same style as the amount wheel */}
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: C.mute, fontWeight: 700, margin: '14px 0 4px' }}>When</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1.3 }}>
            <WheelPicker items={dateOptions} value={dayIdx} onChange={setDayIdx} item={38} />
          </div>
          <div style={{ flex: 1 }}>
            <WheelPicker items={timeOptions} value={timeIdx} onChange={setTimeIdx} item={38} />
          </div>
        </div>
        {!valid && <div style={{ fontSize: 12, color: '#d23b3b', marginTop: 8, textAlign: 'center', fontWeight: 600 }}>Pick a time in the past.</div>}

        <button
          className="press-soft"
          disabled={!valid}
          onClick={() => valid && onAdd(oz, ts)}
          style={{
            width: '100%',
            marginTop: 18,
            padding: 16,
            borderRadius: 999,
            border: 'none',
            cursor: valid ? 'pointer' : 'default',
            background: valid ? C.blueGrad : 'rgba(23,58,94,0.08)',
            color: valid ? '#fff' : C.mute,
            fontSize: 16,
            fontWeight: 700,
            boxShadow: valid ? '0 12px 28px rgba(47,143,214,0.32), inset 0 1px 0 rgba(255,255,255,0.35)' : 'none',
          }}
        >
          Add {oz} oz
        </button>
      </div>
    </>
  )
}
