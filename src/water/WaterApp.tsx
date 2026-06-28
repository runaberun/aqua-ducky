import { useEffect, useState } from 'react'
import { useWaterApp } from './useWaterApp'
import { TodayA } from './screens/TodayA'
import { ActivityHistory } from './screens/ActivityHistory'
import { Stats } from './screens/Stats'
import { TabBar } from './TabBar'
import { GoalSheet } from './GoalSheet'
import { AddEntrySheet } from './AddEntrySheet'
import { CustomAmountSheet } from './CustomAmountSheet'
import { Onboarding } from './Onboarding'
import { Splash } from './Splash'
import { DropGradientDefs } from './Droplet'
import { C, BODY } from './style'

export function WaterApp() {
  const { view: v, showGoal, showAdd, addPresetDate, showCustom, lastLog, needsOnboarding, actions } = useWaterApp()
  const [splashing, setSplashing] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setSplashing(false), 3400)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div
      data-screen-label="Water app"
      style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: C.paperGrad,
        fontFamily: BODY,
        color: C.ink,
      }}
    >
      {/* ambient warm tint blobs — very soft, to echo the logo's paper glow */}
      <div
        style={{
          position: 'absolute',
          top: -70,
          left: -50,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(92,182,239,0.16),transparent 70%)',
          filter: 'blur(6px)',
          pointerEvents: 'none',
          animation: 'glowpulse 7s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 150,
          right: -80,
          width: 230,
          height: 230,
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(245,166,35,0.13),transparent 70%)',
          filter: 'blur(6px)',
          pointerEvents: 'none',
        }}
      />

      <DropGradientDefs />

      {/* scroll area */}
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 56, zIndex: 1 }}>
        {v.isToday && (
          <TodayA
            view={v}
            lastLog={lastLog}
            onLog={actions.logDrink}
            onUndo={actions.undoLast}
            onCustom={actions.openCustom}
            onOpenGoal={actions.openGoal}
            onForgot={actions.openAdd}
          />
        )}
        {v.isHistory && <ActivityHistory view={v} onDelete={actions.deleteEntry} onRange={actions.setHistoryRange} />}
        {v.isStats && <Stats view={v} onCloseDay={actions.closeDay} onAddForDay={actions.openAddForDay} />}
      </div>

      {/* tab bar */}
      <TabBar view={v} onToday={() => actions.go('today')} onHistory={() => actions.go('history')} onStats={() => actions.go('stats')} />

      {/* goal sheet */}
      {showGoal && (
        <GoalSheet
          view={v}
          onClose={actions.closeGoal}
          onSave={actions.saveGoal}
          onInc={actions.incGoal}
          onDec={actions.decGoal}
          onReset={actions.resetToday}
          onEditGoal={actions.editGoal}
          onIncDrop={actions.incDrop}
          onDecDrop={actions.decDrop}
          onEditDropOz={actions.editDropOz}
          onToggleCustom={actions.toggleCustomDrop}
        />
      )}

      {/* retroactive add sheet */}
      {showAdd && <AddEntrySheet onClose={actions.closeAdd} onAdd={actions.logAt} presetDate={addPresetDate} />}

      {/* custom one-off amount */}
      {showCustom && <CustomAmountSheet onClose={actions.closeCustom} onAdd={actions.logCustom} />}

      {/* first-run onboarding */}
      {!splashing && needsOnboarding && <Onboarding onDone={actions.completeOnboarding} />}

      {/* launch splash */}
      {splashing && <Splash />}
    </div>
  )
}
