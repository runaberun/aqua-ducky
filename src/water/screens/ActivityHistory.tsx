import { useState } from 'react'
import type { WaterView } from '../useWaterApp'
import type { HistoryRange } from '../useWaterApp'
import { DISPLAY, C } from '../style'
import { Droplet } from '../Droplet'
import { CloseButton } from '../CloseButton'

interface Props {
  view: WaterView
  onDelete: (id: number) => void
  onRange: (r: HistoryRange) => void
}

function EntryRow({ ozText, sub, onDelete }: { ozText: string; sub: string; onDelete: () => void; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Droplet size={18} />
        <div>
          <div style={{ fontFamily: DISPLAY, fontSize: 19, color: C.ink, lineHeight: 1.05, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{ozText}</div>
          <div style={{ fontSize: 12, color: C.mute, marginTop: 1, fontWeight: 600 }}>{sub}</div>
        </div>
      </div>
      <button
        className="press-soft"
        onClick={onDelete}
        aria-label="Delete this entry"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '7px 12px',
          borderRadius: 999,
          border: '1px solid rgba(214,59,59,0.28)',
          background: 'rgba(214,59,59,0.08)',
          color: '#d23b3b',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
        </svg>
        Delete
      </button>
    </div>
  )
}

export function ActivityHistory({ view: v, onDelete, onRange }: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const isEmpty = v.historyGrouped ? v.activityGroups.length === 0 : v.activityEntries.length === 0

  const groupCard: React.CSSProperties = { borderRadius: 20, background: C.card, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, overflow: 'hidden' }

  return (
    <div data-screen-label="History" style={{ padding: '2px 20px 0' }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 600, color: C.ink, letterSpacing: '0' }}>History</div>

      {/* range dropdown + summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 12 }}>
        <span style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }}>{v.activitySummary}</span>
        <div style={{ position: 'relative' }}>
          <select
            value={v.historyRange}
            onChange={(e) => onRange(e.target.value as HistoryRange)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              padding: '8px 30px 8px 14px',
              borderRadius: 999,
              border: `1px solid ${C.border}`,
              background: C.card,
              boxShadow: C.cardShadow,
              color: C.ink,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              colorScheme: 'light',
            }}
          >
            {v.historyRangeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {isEmpty ? (
        <div style={{ marginTop: 18, padding: '28px 18px', borderRadius: 22, background: C.card, border: '1px dashed rgba(23,58,94,0.18)', textAlign: 'center', color: C.mute, fontSize: 14, fontWeight: 600 }}>
          No water logged in this range.
        </div>
      ) : v.historyGrouped ? (
        // grouped by day
        v.activityGroups.map((g, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 16 : 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{g.label}</span>
              <span style={{ fontSize: 12.5, color: C.ink2, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{g.totalText}</span>
            </div>
            <div style={groupCard}>
              {g.entries.map((e, i) => (
                <div key={e.id} style={{ borderBottom: i < g.entries.length - 1 ? `1px solid ${C.hair}` : 'none' }}>
                  <EntryRow ozText={e.ozText} sub={e.timeText} onDelete={() => setConfirmId(e.id)} />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        // flat list (24h)
        <div style={{ marginTop: 16, borderRadius: 22, background: C.card, border: `1px solid ${C.border}`, boxShadow: C.cardShadow, overflow: 'hidden' }}>
          {v.activityEntries.map((e, i) => (
            <div key={e.id} style={{ borderBottom: i < v.activityEntries.length - 1 ? `1px solid ${C.hair}` : 'none' }}>
              <EntryRow ozText={e.ozText} sub={e.whenText} onDelete={() => setConfirmId(e.id)} />
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 14 }} />

      {/* delete confirmation */}
      {confirmId !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setConfirmId(null)} style={{ position: 'absolute', inset: 0, background: C.scrim }} />
          <div style={{ position: 'relative', width: 264, padding: 22, borderRadius: 24, background: C.cardWarm, border: `1px solid ${C.border}`, boxShadow: '0 24px 60px rgba(70,60,40,0.28)', animation: 'pop .3s ease both' }}>
            <CloseButton onClick={() => setConfirmId(null)} top={10} right={10} />
            <div style={{ fontFamily: DISPLAY, fontSize: 22, color: C.ink, fontWeight: 600, paddingRight: 26 }}>Delete this entry?</div>
            <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 8, lineHeight: 1.4, fontWeight: 600 }}>
              This will remove the logged water and update your totals. This can’t be undone.
            </div>
            <button
              className="press-soft"
              onClick={() => {
                onDelete(confirmId)
                setConfirmId(null)
              }}
              style={{ width: '100%', marginTop: 18, padding: 13, borderRadius: 999, border: 'none', cursor: 'pointer', background: 'linear-gradient(180deg,#ff6b6b,#d23b3b)', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 10px 24px rgba(190,50,50,0.3)' }}
            >
              Delete entry
            </button>
            <button
              className="press-soft"
              onClick={() => setConfirmId(null)}
              style={{ width: '100%', marginTop: 9, padding: 12, borderRadius: 999, border: `1px solid ${C.border}`, cursor: 'pointer', background: '#fff', color: C.ink2, fontSize: 14, fontWeight: 600 }}
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
