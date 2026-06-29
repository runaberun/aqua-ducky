import { useEffect, useRef, useState } from 'react'
import type { WaterView } from '../useWaterApp'
import { DISPLAY, C } from '../style'
import { CountUp } from '../CountUp'
import { HeroDucky } from '../HeroDucky'
import { GoalProgress } from '../GoalProgress'
import { primeAudio, playGoalCue } from '../sound'

interface Props {
  view: WaterView
  lastLog: { id: number; oz: number } | null
  onLog: (oz: number) => void
  onUndo: () => void
  onCustom: () => void
  onOpenGoal: () => void
  onForgot: () => void
}

export function TodayA({ view: v, lastLog, onLog, onUndo, onCustom, onOpenGoal, onForgot }: Props) {
  const [sipping, setSipping] = useState(false)
  // Undo pill visibility, driven by the most recent log
  const [showUndo, setShowUndo] = useState(false)
  const undoTimer = useRef(0)

  const remaining = Math.max(0, v.goalText - v.consumedText)

  // pop the Undo pill on each new drink, auto-hiding after a few seconds
  useEffect(() => {
    if (!lastLog) {
      setShowUndo(false)
      return
    }
    setShowUndo(true)
    window.clearTimeout(undoTimer.current)
    undoTimer.current = window.setTimeout(() => setShowUndo(false), 4500)
    return () => window.clearTimeout(undoTimer.current)
  }, [lastLog])

  const logOz = (oz: number) => {
    if (oz <= 0) return
    primeAudio() // unlock audio within this tap so the goal cue can play
    setSipping(true)
    window.setTimeout(() => setSipping(false), 500)
    onLog(oz)
  }

  // play the celebration cue once, when the goal is first reached
  const celebrated = useRef(false)
  useEffect(() => {
    if (v.celebrate && !celebrated.current) playGoalCue()
    celebrated.current = v.celebrate
  }, [v.celebrate])

  return (
    <div data-screen-label="Today">
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 4px' }}>
        <div style={{ fontSize: 13.5, color: C.ink2, letterSpacing: '.01em', fontWeight: 600 }}>{v.dateText}</div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <button
            className="press"
            onClick={onForgot}
            aria-label="Add a past entry you forgot to record"
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 12px', borderRadius: 999, border: `1px solid ${C.border}`, background: C.card, boxShadow: C.cardShadow, cursor: 'pointer', color: C.ink2, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 8v4l2.5 1.6" />
            </svg>
            Forgot to record?
          </button>
          <button
            className="press"
            onClick={onOpenGoal}
            aria-label="Goal & settings"
            style={{ width: 38, height: 38, borderRadius: '50%', border: `1px solid ${C.border}`, background: C.card, boxShadow: C.cardShadow, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3.1" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 20px 0' }}>
        {/* headline: big number = ounces left to reach the goal */}
        <div style={{ fontSize: 12.5, letterSpacing: '.2em', textTransform: 'uppercase', color: C.mute, fontWeight: 700 }}>{v.greeting}</div>
        {v.goalMet ? (
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 56, lineHeight: 0.9, fontWeight: 600, color: C.green, fontVariantNumeric: 'tabular-nums' }}>0</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 20, color: C.green, fontWeight: 500 }}>oz left</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 64, lineHeight: 0.9, fontWeight: 600, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
                <CountUp value={remaining} />
              </span>
              <span style={{ fontFamily: DISPLAY, fontSize: 22, color: C.ink2, fontWeight: 500 }}>oz left</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.mute, marginTop: 3, fontWeight: 600 }}>to reach your goal</div>
          </>
        )}

        {/* the cup — a progress indicator; it drains as the day's water is logged */}
        <div style={{ marginTop: 6, userSelect: 'none', WebkitUserSelect: 'none' }}>
          <HeroDucky fill={v.cupFill} goalDone={v.goalMet} sipping={sipping} width={300} />
        </div>

        {/* race to the goal: a duck travels to the checkered finish line */}
        <GoalProgress consumed={v.consumedText} goal={v.goalText} celebrate={v.celebrate} />

        {v.goalMet && (
          <div style={{ fontSize: 16, color: C.green, fontWeight: 800, marginTop: 8 }}>You did it, you lucky duck! 😎</div>
        )}

        {/* ---- How much did you drink? — always visible, no extra tap ---- */}
        <div style={{ width: '100%', maxWidth: 340, marginTop: 14 }}>
          <div style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: C.card, boxShadow: C.cardShadow, padding: '14px 14px 16px' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>How much did you drink?</div>

            {/* quick-add buttons — the exact sizes configured in onboarding/settings */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${v.drops.length}, 1fr)`, gap: 8 }}>
              {v.drops.map((d, i) =>
                d.custom ? (
                  <button
                    key={`custom-${i}`}
                    className="press"
                    onClick={onCustom}
                    style={{ padding: '15px 0', borderRadius: 14, border: `1.5px dashed ${C.border}`, background: 'transparent', cursor: 'pointer', fontFamily: DISPLAY, fontSize: 17, fontWeight: 700, color: C.ink2 }}
                  >
                    + Custom
                  </button>
                ) : (
                  <button
                    key={`${d.oz}-${i}`}
                    className="press"
                    onClick={() => logOz(d.oz)}
                    style={{ padding: '15px 0', borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.cardWarm, cursor: 'pointer', fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}
                  >
                    +{d.oz} oz
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* Undo pill — floats in after a log, auto-hides */}
      {showUndo && lastLog && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 14px', borderRadius: 999, background: C.ink, color: '#fff', boxShadow: '0 10px 26px rgba(23,58,94,0.34)', animation: 'rise .22s ease both', pointerEvents: 'auto' }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Logged −{lastLog.oz} oz</span>
            <button
              className="press"
              onClick={() => { onUndo(); setShowUndo(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.16)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5" />
                <path d="M4 9h11a5 5 0 0 1 0 10h-1" />
              </svg>
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
