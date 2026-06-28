import type { WaterView } from '../useWaterApp'
import { DISPLAY, C } from '../style'
import { CountUp } from '../CountUp'
import { CloseButton } from '../CloseButton'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const cardBase: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  boxShadow: C.cardShadow,
}

function StreakCard({ label, value, gold }: { label: string; value: number; accent?: boolean; gold?: boolean }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 20,
        background: gold ? 'radial-gradient(120% 130% at 0% 0%, rgba(245,166,35,0.18), #ffffff)' : C.card,
        border: gold ? '1px solid rgba(245,166,35,0.42)' : `1px solid ${C.border}`,
        boxShadow: C.cardShadow,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <svg width="14" height="16" viewBox="0 0 24 24">
          <path fill={gold ? C.amber : C.blue} d="M13 2c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-1-3-1-3 0 1.5-1 2-1.5 2 .5-3-1.5-7-1.5-9Z" />
        </svg>
        <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: gold ? C.amberDeep : C.mute }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 40, lineHeight: 1, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
          <CountUp value={value} />
        </span>
        <span style={{ fontSize: 14, color: C.ink2, fontWeight: 600 }}>{value === 1 ? 'day' : 'days'}</span>
      </div>
    </div>
  )
}

// Shared green-with-dark-check, used in both "This week" bars and the heatmap.
function MetCheck({ size = '58%' }: { size?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Goal met" style={{ display: 'block' }}>
      <path d="M5 13l4 4L19 7" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type HeatCell = WaterView['weeks'][number]['days'][number]

function HeatBox({ c }: { c: HeatCell }) {
  const cls = c.isToday ? 'today-pulse' : undefined
  const base: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 5,
    overflow: 'hidden',
    cursor: c.onTap ? 'pointer' : 'default',
  }
  if (c.state === 'empty') return <div style={{ width: '100%', aspectRatio: '1 / 1' }} />
  if (c.state === 'none') return <div className={cls} onClick={c.onTap ?? undefined} aria-label="No activity" style={{ ...base, border: '1.5px solid rgba(23,58,94,0.16)', background: 'transparent' }} />
  if (c.state === 'partial') {
    return (
      <div className={cls} onClick={c.onTap ?? undefined} aria-label="Below goal" style={{ ...base, border: '1px solid rgba(47,143,214,0.3)', background: 'rgba(23,58,94,0.04)' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.max(14, Math.round(c.pct * 100))}%`, background: 'linear-gradient(180deg,#6db8ff,#2f8fd6)' }} />
      </div>
    )
  }
  return (
    <div className={cls} onClick={c.onTap ?? undefined} style={{ ...base, background: C.greenGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MetCheck />
    </div>
  )
}

export function Stats({ view: v, onCloseDay, onAddForDay }: { view: WaterView; onCloseDay: () => void; onAddForDay: (iso: string) => void }) {
  return (
    <div data-screen-label="Stats" style={{ padding: '2px 20px 0' }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 600, color: C.ink, letterSpacing: '0' }}>Stats</div>

      {/* two equal streak cards, side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 10 }}>
        <StreakCard label="Current streak" value={v.bigStreakText} accent gold />
        <StreakCard label="Best streak" value={v.longestStreak} />
      </div>

      {/* this week */}
      <div style={{ marginTop: 16, padding: 16, borderRadius: 22, ...cardBase }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>This week</span>
          <span style={{ fontSize: 12, color: C.ink2, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{v.weekMetText}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 84, gap: 8 }}>
          {v.weekBars.map((b, i) => (
            <div key={i} onClick={b.onTap} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}>
              <div className={b.today ? 'today-pulse' : undefined} style={{ width: '100%', maxWidth: 26, flex: 1, display: 'flex', alignItems: 'flex-end', background: 'rgba(23,58,94,0.06)', borderRadius: 7, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: b.heightPct, background: b.barBg, borderRadius: 7, transition: 'height .6s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {b.met && <MetCheck size="62%" />}
                </div>
              </div>
              <span style={{ fontSize: 10.5, color: b.labelColor, fontWeight: 700 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* calendar heatmap — checkmark = goal, fill = some, hollow = none */}
      <div style={{ marginTop: 16, padding: '16px 16px 16px', borderRadius: 22, ...cardBase }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13.5, color: C.ink, fontWeight: 700 }}>Last 30 days</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: C.ink2, fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 13, height: 13, borderRadius: 3, background: C.greenGrad, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="9" height="9" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              Goal
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 13, height: 13, borderRadius: 3, background: 'linear-gradient(180deg,rgba(109,184,255,0.5),#2f8fd6)' }} />
              Some
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 13, height: 13, borderRadius: 3, border: '1.5px solid rgba(23,58,94,0.28)' }} />
              None
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
          {WEEKDAYS.map((d, i) => (
            <span key={`h${i}`} style={{ textAlign: 'center', fontSize: 10.5, color: C.mute, marginBottom: 1, fontWeight: 700 }}>{d}</span>
          ))}
          {v.weeks.flatMap((wk) => wk.days).map((c, i) => (
            <HeatBox key={i} c={c} />
          ))}
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* day detail popup */}
      {v.selDay && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={onCloseDay} style={{ position: 'absolute', inset: 0, background: C.scrim }} />
          <div
            style={{
              position: 'relative',
              width: 240,
              padding: 20,
              borderRadius: 24,
              background: C.cardWarm,
              border: `1px solid ${C.border}`,
              boxShadow: '0 24px 60px rgba(70,60,40,0.28)',
              animation: 'pop .35s ease both',
            }}
          >
            <CloseButton onClick={onCloseDay} top={10} right={10} />
            <div style={{ fontSize: 13, color: C.mute, paddingRight: 28, fontWeight: 600 }}>{v.selDay.dateText}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 6 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 44, color: C.ink, lineHeight: 1, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{v.selDay.ozText}</span>
            </div>
            <div style={{ fontSize: 13, color: C.ink2, marginTop: 2, fontWeight: 600 }}>
              {v.selDay.goalText} · {v.selDay.pctText}
            </div>
            <button
              className="press-soft"
              onClick={() => v.selDay && onAddForDay(v.selDay.dateISO)}
              style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 999, border: 'none', cursor: 'pointer', background: C.blueGrad, color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 10px 22px rgba(47,143,214,0.32), inset 0 1px 0 rgba(255,255,255,0.3)' }}
            >
              + Add an entry
            </button>
            <button
              className="press-soft"
              onClick={onCloseDay}
              style={{ marginTop: 9, width: '100%', padding: 11, borderRadius: 999, border: `1px solid ${C.border}`, background: '#fff', color: C.ink2, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
