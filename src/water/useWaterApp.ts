import { useCallback, useMemo, useRef, useState } from 'react'
import { buildHistory, midnight, type DayRecord } from './history'
import { GLASS, RING } from './layout'
import { C } from './style'

export type Screen = 'today' | 'history' | 'stats'
export type AnimState = 'idle' | 'burst'
type ReminderKey = 'morning' | 'midday' | 'afternoon' | 'evening'

export interface DropConfig {
  oz: number
  custom?: boolean
}

interface FallingDrop {
  id: number
  oz: number
  leftPct: number
}
interface Splash {
  id: number
}
interface LogEntry {
  id: number
  oz: number
  ts: number
}

export type HistoryRange = '24h' | '7d' | '30d'

// ---- the seeded history is stable for the session ----
const INITIAL_GOAL = 80
const DEFAULT_DROPS: DropConfig[] = [{ oz: 8 }, { oz: 16 }, { oz: 0, custom: true }]

// ---- persisted config (goal, quick-add sizes, onboarding) ----
interface Persisted {
  goalOz: number
  drops: DropConfig[]
  onboarded: boolean
}
const STORE_KEY = 'wt_config_v1'
function loadConfig(): Persisted {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && Array.isArray(p.drops) && p.drops.length === 3) return p
    }
  } catch {
    /* ignore */
  }
  return { goalOz: INITIAL_GOAL, drops: DEFAULT_DROPS, onboarded: false }
}
function saveConfig(p: Persisted) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

function sameDay(a: number, b: number): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

// split a daily total into a few plausible entries
function splitOz(oz: number): number[] {
  const out: number[] = []
  let r = oz
  while (r > 0 && out.length < 6) {
    let a = r >= 16 ? 16 : r >= 8 ? 8 : 2
    if (a > r) a = r
    out.push(a)
    r -= a
  }
  if (r > 0 && out.length) out[out.length - 1] += r
  return out
}

const DAY_HOURS = [8, 11, 14, 17, 20, 9, 16]

// Seeded activity log: today (sums to 36 oz) + synthesized entries for the
// last 29 days so the History ranges (7d / 30d) are populated and grouped.
function buildSeedLog(history: DayRecord[]): LogEntry[] {
  const now = Date.now()
  const H = 3600 * 1000
  let id = 1
  const today: LogEntry[] = [
    { id: id++, oz: 2, ts: now - 0.4 * H },
    { id: id++, oz: 2, ts: now - 1.3 * H },
    { id: id++, oz: 8, ts: now - 2.6 * H },
    { id: id++, oz: 16, ts: now - 4.5 * H },
    { id: id++, oz: 8, ts: now - 6.8 * H },
  ]
  const past: LogEntry[] = []
  const recent = history.slice(-29)
  for (let k = recent.length - 1; k >= 0; k--) {
    const d = recent[k]
    if (d.oz <= 0) continue
    splitOz(d.oz).forEach((a, idx) => {
      const hour = DAY_HOURS[idx % DAY_HOURS.length]
      const ts = d.date.getTime() + hour * H + idx * 7 * 60 * 1000
      past.push({ id: id++, oz: a, ts })
    })
  }
  return [...today, ...past].sort((a, b) => b.ts - a.ts)
}

export function useWaterApp() {
  // history built once (depends only on the initial goal, like the prototype)
  const historyRef = useRef<DayRecord[]>()
  if (!historyRef.current) historyRef.current = buildHistory(INITIAL_GOAL)
  const history = historyRef.current

  // seeded multi-day log, built once from history
  const seedRef = useRef<LogEntry[]>()
  if (!seedRef.current) seedRef.current = buildSeedLog(history)

  // persisted config (loaded once)
  const cfgRef = useRef<Persisted>()
  if (!cfgRef.current) cfgRef.current = loadConfig()

  const [screen, setScreen] = useState<Screen>('today')
  const [goalOz, setGoalOz] = useState(cfgRef.current.goalOz)
  const [drops, setDropsState] = useState<DropConfig[]>(cfgRef.current.drops)
  const [onboarded, setOnboarded] = useState(cfgRef.current.onboarded)
  const [consumedOz, setConsumedOz] = useState(36)
  const [sipOz, setSipOz] = useState(8)
  // the most recent drink logged from the Today screen — powers the Undo pill
  const [lastLog, setLastLog] = useState<{ id: number; oz: number } | null>(null)
  const [log, setLog] = useState<LogEntry[]>(seedRef.current)
  const [historyRange, setHistoryRange] = useState<HistoryRange>('24h')
  const [showAdd, setShowAdd] = useState(false)
  const [addPresetDate, setAddPresetDate] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [fallingDrops, setFallingDrops] = useState<FallingDrop[]>([])
  const [splashes, setSplashes] = useState<Splash[]>([])
  const [celebrate, setCelebrate] = useState(false)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [showGoal, setShowGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(cfgRef.current.goalOz)
  const [dropsDraft, setDropsDraft] = useState<DropConfig[]>(cfgRef.current.drops)
  const [reminders, setReminders] = useState<Record<ReminderKey, boolean>>({
    morning: true,
    midday: true,
    afternoon: false,
    evening: true,
  })
  const [aAnim, setAAnim] = useState<AnimState[]>(['idle', 'idle', 'idle'])

  // monotonic id source — start past every seeded id
  const idRef = useRef(seedRef.current.reduce((m, e) => Math.max(m, e.id), 0) + 1)
  const nextId = () => idRef.current++

  // refs mirror state so multi-update handlers stay out of the state updaters
  const consumedRef = useRef(36)
  const logRef = useRef<LogEntry[]>(log)

  // ------------------------------------------------------------------
  //  Actions
  // ------------------------------------------------------------------
  const addWater = useCallback(
    (oz: number) => {
      const id = nextId()
      const prev = consumedRef.current
      const next = prev + oz
      consumedRef.current = next
      const nowMet = prev < goalOz && next >= goalOz
      setConsumedOz(next)
      logRef.current = [{ id, oz, ts: Date.now() }, ...logRef.current]
      setLog(logRef.current)
      setLastLog({ id, oz })
      if (nowMet) {
        setCelebrate(true)
        window.setTimeout(() => setCelebrate(false), 3400)
      }
      setSplashes((s) => [...s, { id }])
      window.setTimeout(() => {
        setSplashes((s) => s.filter((x) => x.id !== id))
      }, 720)
    },
    [goalOz],
  )

  const deleteEntry = useCallback(
    (id: number) => {
      const entry = logRef.current.find((x) => x.id === id)
      if (!entry) return
      logRef.current = logRef.current.filter((x) => x.id !== id)
      setLog(logRef.current)
      // only today's entries roll into today's running total
      if (sameDay(entry.ts, Date.now())) {
        consumedRef.current = Math.max(0, consumedRef.current - entry.oz)
        setConsumedOz(consumedRef.current)
        if (consumedRef.current < goalOz) setCelebrate(false)
      }
    },
    [goalOz],
  )

  // log a drink from the Today screen (presets or the waterline drag).
  // identical to addWater, but named for intent and used by the Undo pill.
  const logDrink = useCallback((oz: number) => addWater(oz), [addWater])

  // undo the most recent drink (removes it from the log + today's total)
  const undoLast = useCallback(() => {
    if (!lastLog) return
    deleteEntry(lastLog.id)
    setLastLog(null)
  }, [lastLog, deleteEntry])

  // retroactively log water at a chosen timestamp
  const logAt = useCallback(
    (oz: number, ts: number) => {
      const id = nextId()
      logRef.current = [{ id, oz, ts }, ...logRef.current].sort((a, b) => b.ts - a.ts)
      setLog(logRef.current)
      if (sameDay(ts, Date.now())) {
        const prev = consumedRef.current
        const next = prev + oz
        consumedRef.current = next
        setConsumedOz(next)
        if (prev < goalOz && next >= goalOz) {
          setCelebrate(true)
          window.setTimeout(() => setCelebrate(false), 3400)
        }
      }
      setShowAdd(false)
    },
    [goalOz],
  )

  const selectDrop = useCallback(
    (oz: number) => {
      const id = nextId()
      const leftPct = 50 + (Math.random() * 22 - 11)
      setFallingDrops((d) => [...d, { id, oz, leftPct }])
      window.setTimeout(() => {
        setFallingDrops((d) => d.filter((x) => x.id !== id))
        addWater(oz)
      }, 510)
    },
    [addWater],
  )

  // tap one of the three quick-add drops (by index)
  const onDrop = useCallback(
    (i: number) => {
      const cfg = drops[i]
      if (!cfg) return
      if (cfg.custom) {
        setShowCustom(true)
        return
      }
      setAAnim((a) => a.map((s, j) => (j === i ? 'burst' : s)))
      selectDrop(cfg.oz)
      window.setTimeout(() => setAAnim((a) => a.map((s, j) => (j === i ? 'idle' : s))), 520)
    },
    [drops, selectDrop],
  )

  // one swipe = one sip of the currently-selected size (drains the cup)
  const sip = useCallback(() => {
    addWater(sipOz)
  }, [addWater, sipOz])

  // log a custom one-off amount at the current time
  const logCustom = useCallback(
    (oz: number) => {
      if (oz > 0) selectDrop(oz)
      setShowCustom(false)
    },
    [selectDrop],
  )

  const resetToday = useCallback(() => {
    consumedRef.current = 0
    setConsumedOz(0)
    // only clear today's entries; past days stay in the log
    logRef.current = logRef.current.filter((e) => !sameDay(e.ts, Date.now()))
    setLog(logRef.current)
    setCelebrate(false)
    setLastLog(null)
  }, [])

  const openAdd = useCallback(() => {
    setAddPresetDate(null)
    setShowAdd(true)
  }, [])
  const closeAdd = useCallback(() => setShowAdd(false), [])
  // open the add sheet pre-filled with a specific day (from a day-detail popup)
  const openAddForDay = useCallback((iso: string) => {
    setSelectedDayKey(null)
    setAddPresetDate(iso)
    setShowAdd(true)
  }, [])
  const openCustom = useCallback(() => setShowCustom(true), [])
  const closeCustom = useCallback(() => setShowCustom(false), [])

  // onboarding (first run) — set goal + quick-add sizes
  const completeOnboarding = useCallback((g: number, ds: DropConfig[]) => {
    setGoalOz(g)
    setDropsState(ds)
    setOnboarded(true)
    saveConfig({ goalOz: g, drops: ds, onboarded: true })
  }, [])

  const go = useCallback((s: Screen) => {
    setScreen(s)
    setSelectedDayKey(null)
  }, [])

  const openGoal = useCallback(() => {
    setGoalDraft(goalOz)
    setDropsDraft(drops)
    setShowGoal(true)
  }, [goalOz, drops])
  const closeGoal = useCallback(() => setShowGoal(false), [])
  const saveGoal = useCallback(() => {
    setGoalOz(goalDraft)
    setDropsState(dropsDraft)
    setShowGoal(false)
    saveConfig({ goalOz: goalDraft, drops: dropsDraft, onboarded: true })
  }, [goalDraft, dropsDraft])
  const incGoal = useCallback(() => setGoalDraft((g) => Math.min(200, g + 1)), [])
  const decGoal = useCallback(() => setGoalDraft((g) => Math.max(8, g - 1)), [])
  const editGoal = useCallback((n: number) => setGoalDraft(Math.max(8, Math.min(200, n))), [])
  const incDrop = useCallback((i: number) => setDropsDraft((ds) => ds.map((d, j) => (j === i ? { oz: Math.min(64, (d.oz || 0) + 1) } : d))), [])
  const decDrop = useCallback((i: number) => setDropsDraft((ds) => ds.map((d, j) => (j === i ? { oz: Math.max(1, (d.oz || 0) - 1) } : d))), [])
  const editDropOz = useCallback(
    (i: number, n: number) => setDropsDraft((ds) => ds.map((d, j) => (j === i ? { oz: Math.max(1, Math.min(64, n)) } : d))),
    [],
  )
  const toggleCustomDrop = useCallback(
    (i: number) => setDropsDraft((ds) => ds.map((d, j) => (j === i ? (d.custom ? { oz: 8 } : { oz: 0, custom: true }) : d))),
    [],
  )
  const toggleReminder = useCallback((k: ReminderKey) => {
    setReminders((r) => ({ ...r, [k]: !r[k] }))
  }, [])
  const selectDay = useCallback((key: string) => setSelectedDayKey(key), [])
  const closeDay = useCallback(() => setSelectedDayKey(null), [])

  // ------------------------------------------------------------------
  //  Derived view (port of renderVals)
  // ------------------------------------------------------------------
  const view = useMemo(
    () =>
      computeView({
        screen,
        goalOz,
        consumedOz,
        sipOz,
        log,
        historyRange,
        reminders,
        selectedDayKey,
        goalDraft,
        drops,
        dropsDraft,
        aAnim,
        fallingDrops,
        splashes,
        celebrate,
        history,
        selectDay,
        toggleReminder,
      }),
    [
      screen,
      goalOz,
      consumedOz,
      sipOz,
      log,
      historyRange,
      reminders,
      selectedDayKey,
      goalDraft,
      drops,
      dropsDraft,
      aAnim,
      fallingDrops,
      splashes,
      celebrate,
      history,
      selectDay,
      toggleReminder,
    ],
  )

  return {
    view,
    showGoal,
    showAdd,
    addPresetDate,
    showCustom,
    lastLog,
    needsOnboarding: !onboarded,
    actions: {
      go,
      logDrink,
      undoLast,
      openGoal,
      closeGoal,
      saveGoal,
      incGoal,
      decGoal,
      editGoal,
      incDrop,
      decDrop,
      editDropOz,
      toggleCustomDrop,
      resetToday,
      closeDay,
      deleteEntry,
      logAt,
      openAdd,
      closeAdd,
      openAddForDay,
      openCustom,
      closeCustom,
      logCustom,
      completeOnboarding,
      setHistoryRange,
      onDrop,
      sip,
      setSipOz,
    },
  }
}

// ------------------------------------------------------------------
//  Pure view computation
// ------------------------------------------------------------------
interface ComputeInput {
  screen: Screen
  goalOz: number
  consumedOz: number
  sipOz: number
  log: LogEntry[]
  historyRange: HistoryRange
  reminders: Record<ReminderKey, boolean>
  selectedDayKey: string | null
  goalDraft: number
  drops: DropConfig[]
  dropsDraft: DropConfig[]
  aAnim: AnimState[]
  fallingDrops: FallingDrop[]
  splashes: Splash[]
  celebrate: boolean
  history: DayRecord[]
  selectDay: (key: string) => void
  toggleReminder: (k: ReminderKey) => void
}

function computeView(S: ComputeInput) {
  const goal = S.goalOz
  const consumed = S.consumedOz
  const pct = goal > 0 ? consumed / goal : 0
  const pctC = Math.max(0, Math.min(1, pct))
  const today = midnight()

  const todayCell: DayRecord = {
    key: 'today',
    date: today,
    oz: consumed,
    goal,
    pct: goal > 0 ? consumed / goal : 0,
    isToday: true,
  }
  const allDays = [...S.history, todayCell]

  // streak: current run of met days, surviving an in-progress today
  let streak = 0
  let si = allDays.length - 1
  if (allDays[si].pct < 1) si--
  for (; si >= 0; si--) {
    if (allDays[si].pct >= 1) streak++
    else break
  }

  let longest = 0
  let run = 0
  allDays.forEach((d) => {
    if (d.pct >= 1) {
      run++
      longest = Math.max(longest, run)
    } else run = 0
  })

  const last30 = allDays.slice(-30)
  const comp30 = last30.filter((d) => d.pct >= 1).length / last30.length
  const last7 = allDays.slice(-7)
  const best = allDays.reduce((m, d) => Math.max(m, d.oz), 0)

  // ---- calendar heatmap (last 30 days, laid out as weekday columns / week rows) ----
  const heatDays = allDays.slice(-30)
  const dow = (heatDays[0].date.getDay() + 6) % 7
  type Cell = (DayRecord & { empty?: false }) | { empty: true }
  const cells: Cell[] = []
  for (let i = 0; i < dow; i++) cells.push({ empty: true })
  heatDays.forEach((d) => cells.push(d))
  while (cells.length % 7 !== 0) cells.push({ empty: true })

  type HeatState = 'empty' | 'none' | 'partial' | 'met'
  interface HeatDay {
    state: HeatState
    pct: number
    isToday: boolean
    onTap: (() => void) | null
  }
  const weeks: { days: HeatDay[] }[] = []
  for (let w = 0; w < cells.length / 7; w++) {
    const slice = cells.slice(w * 7, w * 7 + 7)
    const daysArr: HeatDay[] = slice.map((c) => {
      if (c.empty) return { state: 'empty', pct: 0, isToday: false, onTap: null }
      const p = Math.max(0, Math.min(1, c.pct))
      const state: HeatState = c.pct >= 1 ? 'met' : c.pct > 0.005 ? 'partial' : 'none'
      const key = c.key
      return { state, pct: p, isToday: !!c.isToday, onTap: () => S.selectDay(key) }
    })
    weeks.push({ days: daysArr })
  }

  // ---- selected day popup ----
  let selDay: {
    dateText: string
    dateISO: string
    ozText: string
    goalText: string
    pctText: string
  } | null = null
  if (S.selectedDayKey) {
    const d = allDays.find((x) => x.key === S.selectedDayKey)
    if (d) {
      const pad = (n: number) => String(n).padStart(2, '0')
      selDay = {
        dateText: d.date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        dateISO: d.date.getFullYear() + '-' + pad(d.date.getMonth() + 1) + '-' + pad(d.date.getDate()),
        ozText: d.oz + ' oz',
        goalText: 'of ' + d.goal + ' oz',
        pctText: Math.round(d.pct * 100) + '%',
      }
    }
  }

  // ---- stats "This week" bars (intake height + goal-met = green + check) ----
  const dlabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const weekBars = last7.map((d) => {
    const p = Math.max(0, Math.min(1, d.pct))
    const h = Math.max(6, Math.round(p * 100))
    const wd = (d.date.getDay() + 6) % 7
    const met = d.pct >= 1
    const key = d.key
    return {
      label: dlabel[wd],
      met,
      today: d.key === 'today',
      heightPct: h + '%',
      onTap: () => S.selectDay(key),
      barBg: met
        ? C.greenGrad
        : p < 0.12
          ? 'rgba(23,58,94,0.10)'
          : 'linear-gradient(180deg,#6db8ff,#2f8fd6)',
      labelColor: d.key === 'today' ? C.green : 'rgba(23,58,94,0.45)',
    }
  })

  // ---- achievements ----
  const ach = [
    { id: 'first', title: 'First Drop', desc: 'Log your first sip', unlocked: true, progressText: '' },
    { id: 'crush', title: 'Goal Crusher', desc: 'Hit 100% in a day', unlocked: allDays.some((d) => d.pct >= 1), progressText: '' },
    { id: 'roll', title: 'On a Roll', desc: '3-day streak', unlocked: longest >= 3, progressText: Math.min(longest, 3) + ' / 3' },
    { id: 'week', title: 'Week Warrior', desc: '7-day streak', unlocked: longest >= 7, progressText: Math.min(longest, 7) + ' / 7' },
    { id: 'iron', title: 'Iron Will', desc: '14-day streak', unlocked: longest >= 14, progressText: Math.min(longest, 14) + ' / 14' },
    { id: 'hero', title: 'Hydration Hero', desc: 'Meet goal 80% of 30 days', unlocked: comp30 >= 0.8, progressText: Math.round(comp30 * 100) + '% / 80%' },
    { id: 'over', title: 'Overflow', desc: 'Exceed 125% in one day', unlocked: best >= goal * 1.25, progressText: '' },
    { id: 'half', title: 'Half Gallon', desc: '64 oz in a single day', unlocked: best >= 64, progressText: '' },
  ]
  const unlockedCount = ach.filter((x) => x.unlocked).length
  const achievements = ach.map((x) => ({
    title: x.title,
    desc: x.desc,
    ringColor: x.unlocked ? '#f3d28a' : 'rgba(255,255,255,0.22)',
    borderColor: x.unlocked ? 'rgba(240,198,106,0.4)' : 'rgba(255,255,255,0.1)',
    cardBg: x.unlocked
      ? 'radial-gradient(120% 90% at 50% 0%, rgba(240,198,106,0.14), rgba(255,255,255,0.04))'
      : 'rgba(255,255,255,0.04)',
    opacity: x.unlocked ? 1 : 0.5,
    showProgress: !x.unlocked && !!x.progressText,
    progressText: x.progressText || '',
  }))

  // ---- progress ring geometry ----
  const r = RING.r
  const circ = 2 * Math.PI * r
  const ringAngle = pctC * 2 * Math.PI
  const ringPctX = (RING.center + r * Math.sin(ringAngle)).toFixed(1) + 'px'
  const ringPctY = (RING.center - r * Math.cos(ringAngle)).toFixed(1) + 'px'

  // ---- reminders ----
  const remDefs: { key: ReminderKey; label: string; time: string }[] = [
    { key: 'morning', label: 'Morning', time: '8:00 AM' },
    { key: 'midday', label: 'Midday', time: '12:30 PM' },
    { key: 'afternoon', label: 'Afternoon', time: '3:30 PM' },
    { key: 'evening', label: 'Evening', time: '7:00 PM' },
  ]
  const reminders = remDefs.map((rd) => {
    const on = !!S.reminders[rd.key]
    return {
      label: rd.label,
      time: rd.time,
      onTap: () => S.toggleReminder(rd.key),
      trackBg: on ? C.blueGrad : 'rgba(23,58,94,0.16)',
      knobLeft: on ? '23px' : '3px',
    }
  })

  // ---- time-of-day pacing ----
  const nowD = new Date()
  const nowMin = nowD.getHours() * 60 + nowD.getMinutes()
  const wakeStart = 7 * 60
  const dayEnd = 22 * 60
  const elapsedFrac = Math.max(0, Math.min(1, (nowMin - wakeStart) / (dayEnd - wakeStart)))
  const idealPct = Math.round(elapsedFrac * 100) + '%'
  const expectedOz = goal * elapsedFrac
  const fmtTime = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = Math.round(mins % 60)
    const ap = h >= 12 ? 'PM' : 'AM'
    let hh = h % 12
    if (hh === 0) hh = 12
    return hh + ':' + String(m).padStart(2, '0') + ' ' + ap
  }
  const nowTimeText = fmtTime(Math.max(wakeStart, Math.min(dayEnd, nowMin)))
  const pdiff = consumed - expectedOz
  let paceLabel: string
  let paceColor: string
  if (consumed >= goal) {
    paceLabel = 'Goal complete — nicely done'
    paceColor = C.green
  } else if (elapsedFrac <= 0.02) {
    paceLabel = 'Fresh start'
    paceColor = C.blue
  } else if (pdiff > goal * 0.05) {
    paceLabel = 'Ahead of pace'
    paceColor = C.green
  } else if (pdiff < -goal * 0.08) {
    paceLabel = 'A little behind'
    paceColor = '#c9790a'
  } else {
    const elapsedHours = Math.max(0.5, (nowMin - wakeStart) / 60)
    const rate = consumed / elapsedHours
    const remaining = goal - consumed
    if (rate > 0.5) {
      const finishMin = nowMin + (remaining / rate) * 60
      paceLabel = finishMin <= dayEnd + 120 ? 'On pace for ' + fmtTime(finishMin) : 'On pace'
    } else paceLabel = 'On pace'
    paceColor = C.blue
  }

  const weekMet = last7.filter((d) => d.pct >= 1).length
  const weekMetText = weekMet + ' of 7 days met'

  const hr = new Date().getHours()
  const greeting =
    hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : hr < 21 ? 'Good evening' : 'Wind down'

  // ---- activity history (range-aware) ----
  const nowMs = Date.now()
  const RANGE_MS = { '24h': 24 * 3600 * 1000, '7d': 7 * 86400 * 1000, '30d': 30 * 86400 * 1000 }
  const inRange = S.log.filter((e) => nowMs - e.ts <= RANGE_MS[S.historyRange]).sort((a, b) => b.ts - a.ts)
  const historyGrouped = S.historyRange !== '24h'
  const historyTotal = inRange.reduce((a, e) => a + e.oz, 0)
  const rangeWord = S.historyRange === '24h' ? 'last 24 hours' : S.historyRange === '7d' ? 'last 7 days' : 'last 30 days'
  const activitySummary =
    inRange.length === 0
      ? `No activity in the ${rangeWord}`
      : inRange.length + (inRange.length === 1 ? ' entry · ' : ' entries · ') + historyTotal + ' oz'

  // flat list (24h view)
  const activityEntries = inRange.map((e) => ({
    id: e.id,
    ozText: '+' + e.oz + ' oz',
    whenText: new Date(e.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  }))

  // grouped by day (7d / 30d views)
  const yesterday = new Date(nowMs)
  yesterday.setDate(yesterday.getDate() - 1)
  const dayLabelFor = (ts: number) => {
    if (sameDay(ts, nowMs)) return 'Today'
    if (sameDay(ts, yesterday.getTime())) return 'Yesterday'
    return new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  const groupMap = new Map<string, { label: string; ts: number; total: number; entries: { id: number; ozText: string; timeText: string }[] }>()
  inRange.forEach((e) => {
    const d = new Date(e.ts)
    const k = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
    if (!groupMap.has(k)) groupMap.set(k, { label: dayLabelFor(e.ts), ts: e.ts, total: 0, entries: [] })
    const g = groupMap.get(k)!
    g.total += e.oz
    g.entries.push({ id: e.id, ozText: '+' + e.oz + ' oz', timeText: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })
  })
  const activityGroups = [...groupMap.values()]
    .sort((a, b) => b.ts - a.ts)
    .map((g) => ({ label: g.label, totalText: g.total + ' oz', entries: g.entries }))

  const historyRangeOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
  ]

  // ---- personal trends ----
  const WD_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  // best weekday (by average intake on days with activity)
  const dowSum = Array(7).fill(0)
  const dowCnt = Array(7).fill(0)
  allDays.forEach((d) => {
    if (d.oz > 0) {
      const wd = (d.date.getDay() + 6) % 7
      dowSum[wd] += d.oz
      dowCnt[wd]++
    }
  })
  let bestWd = 0
  let bestWdAvg = -1
  for (let i = 0; i < 7; i++) {
    const a = dowCnt[i] ? dowSum[i] / dowCnt[i] : 0
    if (a > bestWdAvg) {
      bestWdAvg = a
      bestWd = i
    }
  }
  // weekend vs weekday
  const meanOz = (arr: DayRecord[]) => (arr.length ? arr.reduce((a, d) => a + d.oz, 0) / arr.length : 0)
  const weAvg = meanOz(allDays.filter((d) => ((d.date.getDay() + 6) % 7) >= 5))
  const wdAvg = meanOz(allDays.filter((d) => ((d.date.getDay() + 6) % 7) < 5))
  let weekendText: string
  if (weAvg > wdAvg * 1.08) weekendText = `You hydrate better on weekends — about ${Math.round(weAvg)} oz vs ${Math.round(wdAvg)} oz on weekdays.`
  else if (weAvg < wdAvg * 0.92) weekendText = `You slip a little on weekends — about ${Math.round(weAvg)} oz vs ${Math.round(wdAvg)} oz on weekdays.`
  else weekendText = `You're steady across the week — about ${Math.round(weAvg)} oz on weekends and ${Math.round(wdAvg)} oz on weekdays.`
  // peak hour + pacing, from today's timestamped log
  const fmtHour = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`
  const hourSum: Record<number, number> = {}
  S.log.forEach((e) => {
    const h = new Date(e.ts).getHours()
    hourSum[h] = (hourSum[h] || 0) + e.oz
  })
  const hourKeys = Object.keys(hourSum).map(Number)
  const logTotal = hourKeys.reduce((a, h) => a + hourSum[h], 0)
  let peakHour = -1
  let peakHourOz = -1
  hourKeys.forEach((h) => {
    if (hourSum[h] > peakHourOz) {
      peakHourOz = hourSum[h]
      peakHour = h
    }
  })
  const topShare = logTotal > 0 ? peakHourOz / logTotal : 0
  const pacingBalanced = hourKeys.length >= 3 && topShare < 0.5

  // illustrated-card data for the Trends tab
  const weekAvgs = Array.from({ length: 7 }, (_, i) => (dowCnt[i] ? Math.round(dowSum[i] / dowCnt[i]) : 0))
  const dayFrac = (h: number) => Math.max(0, Math.min(1, (h - 6) / (24 - 6)))
  const todayHours = S.log
    .filter((e) => sameDay(e.ts, nowMs))
    .map((e) => {
      const d = new Date(e.ts)
      return d.getHours() + d.getMinutes() / 60
    })
    .sort((a, b) => a - b)
  const weekendDeltaPct = wdAvg > 0 ? Math.round(((weAvg - wdAvg) / wdAvg) * 100) : 0
  const weekendVerdict = weAvg > wdAvg * 1.08 ? 'up' : weAvg < wdAvg * 0.92 ? 'down' : 'even'

  const trendData = {
    bestDay: {
      dayName: WD_FULL[bestWd],
      avg: Math.round(bestWdAvg),
      weekAvgs,
      bestIdx: bestWd,
      text: `${WD_FULL[bestWd]}s are your strongest — you average about ${Math.round(bestWdAvg)} oz.`,
    },
    peakTime: {
      label: peakHour >= 0 ? fmtHour(peakHour) : '—',
      frac: peakHour >= 0 ? dayFrac(peakHour) : 0.5,
      hasData: peakHour >= 0,
      text: peakHour >= 0 ? `You drink the most around ${fmtHour(peakHour)} — your biggest hydration window.` : 'Log a few drinks to reveal your peak time of day.',
    },
    pacing: {
      label: pacingBalanced ? 'Balanced' : 'Bursty',
      balanced: pacingBalanced,
      marks: todayHours.map(dayFrac),
      text: hourKeys.length === 0 ? 'Start logging to see how you pace your day.' : pacingBalanced ? 'You sip steadily through the day — nicely balanced.' : 'You drink in big bursts — try spreading it out.',
    },
    weekend: {
      weAvg: Math.round(weAvg),
      wdAvg: Math.round(wdAvg),
      deltaPct: weekendDeltaPct,
      verdict: weekendVerdict,
      text: weekendText,
    },
  }

  return {
    screen: S.screen,
    isToday: S.screen === 'today',
    isHistory: S.screen === 'history',
    isStats: S.screen === 'stats',

    // quick-add drops (configurable, one may be custom)
    drops: S.drops.map((d, i) => {
      const burst = S.aAnim[i] === 'burst'
      const size = d.custom ? 58 : Math.round(Math.max(46, Math.min(74, 40 + d.oz * 1.4)))
      return {
        custom: !!d.custom,
        oz: d.oz,
        size,
        fontSize: d.custom ? 26 : Math.max(16, Math.round(size * 0.4)),
        amountText: d.custom ? '+' : String(d.oz),
        labelText: d.custom ? 'Custom' : `${d.oz} oz`,
        punch: burst ? 'dpunch .5s ease' : 'none',
        ring: burst ? 'dburstring .55s ease-out' : 'none',
      }
    }),
    dropsDraft: S.dropsDraft.map((d) => ({ custom: !!d.custom, oz: d.oz, label: d.custom ? 'Custom' : `${d.oz} oz` })),

    // tab colors
    tcToday: S.screen === 'today' ? C.blue : 'rgba(23,58,94,0.4)',
    tcHistory: S.screen === 'history' ? C.blue : 'rgba(23,58,94,0.4)',
    tcStats: S.screen === 'stats' ? C.blue : 'rgba(23,58,94,0.4)',

    // hero numbers
    consumedText: consumed,
    goalText: goal,
    pctText: Math.round(pct * 100) + '%',
    goalMet: pct >= 1,
    fillPct: (pctC * 100).toFixed(1) + '%',
    fillPx: Math.round(pctC * GLASS.h) + 'px',
    // cup drains as you drink: 1 = full at the day's goal, 0 = empty (goal met)
    cupFill: goal > 0 ? Math.max(0, Math.min(1, (goal - consumed) / goal)) : 0,
    sipOz: S.sipOz,
    // duck rides the water surface — positioned relative to the ring box (outside
    // the glass clip) so at full it sits at the rim instead of going under.
    duckBottomPx: Math.round((RING.box - GLASS.h) / 2 + Math.max(0, Math.round(pctC * GLASS.h) - 4)) + 'px',
    dropletNote: consumed >= goal ? 'Goal complete' : Math.max(0, goal - consumed) + ' oz to go',

    // activity history (History tab)
    historyRange: S.historyRange,
    historyRangeOptions,
    historyGrouped,
    activityEntries,
    activityGroups,
    activitySummary,

    // ring
    ringDash: circ + ' ' + circ,
    ringOffset: circ * (1 - pctC),
    ringColor: pct >= 1 ? '#13a378' : '#1f9e85',
    ringPctX,
    ringPctY,

    streakText: streak,
    dateText: today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    greeting,

    paceLabel,
    paceColor,
    idealPct,
    nowTimeText,
    weekMetText,

    fallingDrops: S.fallingDrops,
    splashes: S.splashes,
    celebrate: S.celebrate,

    // heatmap (Stats screen)
    weeks,
    selDay,

    weekBars,
    bigStreakText: streak,
    longestStreak: longest,

    // trends tab + awards (awards live at the bottom of Stats)
    trendData,
    achievements,
    awardsSummaryText: unlockedCount + ' of ' + ach.length + ' unlocked',

    // goal sheet
    goalDraftText: S.goalDraft,
    goalGlasses: Math.round(S.goalDraft / 8),
    reminders,
  }
}

export type WaterView = ReturnType<typeof computeView>
