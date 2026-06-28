import type { WaterView } from './useWaterApp'

interface Props {
  view: WaterView
  onToday: () => void
  onHistory: () => void
  onStats: () => void
}

const tabBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '4px 12px',
}

export function TabBar({ view: v, onToday, onHistory, onStats }: Props) {
  return (
    <div
      style={{
        flex: 'none',
        position: 'relative',
        zIndex: 5,
        padding: '9px 14px 24px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'linear-gradient(180deg,rgba(245,241,232,0),rgba(245,241,232,0.92) 42%)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(23,58,94,0.08)',
      }}
    >
      <button className="press" onClick={onToday} style={tabBtn}>
        <svg width="23" height="23" viewBox="0 0 24 24">
          <path fill={v.tcToday} d="M12 3C12 3 5.5 10.5 5.5 15.5C5.5 19.1 8.4 21.5 12 21.5C15.6 21.5 18.5 19.1 18.5 15.5C18.5 10.5 12 3 12 3Z" />
        </svg>
        <span style={{ fontSize: 10, letterSpacing: '.03em', color: v.tcToday }}>Today</span>
      </button>
      <button className="press" onClick={onHistory} style={tabBtn}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={v.tcHistory} strokeWidth="1.7">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 10, letterSpacing: '.03em', color: v.tcHistory }}>History</span>
      </button>
      <button className="press" onClick={onStats} style={tabBtn}>
        <svg width="23" height="23" viewBox="0 0 24 24">
          <rect x="3.5" y="13" width="4" height="7" rx="1.3" fill={v.tcStats} />
          <rect x="10" y="8" width="4" height="12" rx="1.3" fill={v.tcStats} />
          <rect x="16.5" y="4" width="4" height="16" rx="1.3" fill={v.tcStats} />
        </svg>
        <span style={{ fontSize: 10, letterSpacing: '.03em', color: v.tcStats }}>Stats</span>
      </button>
    </div>
  )
}
