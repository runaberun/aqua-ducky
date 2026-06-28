// ------------------------------------------------------------------
//  Seeded demo history + date helpers
//  Ported from the prototype's buildHistory() / rng() / date utils.
// ------------------------------------------------------------------

export interface DayRecord {
  key: string
  date: Date
  oz: number
  goal: number
  pct: number
  isToday?: boolean
}

/** Deterministic PRNG (mulberry32-style) so demo data is stable. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function midnight(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

export function dkey(d: Date): string {
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
}

/** Build the seeded 118-day demo history (excludes today). */
export function buildHistory(goalOz: number): DayRecord[] {
  const rand = rng(0x9e3779b9)
  const today = midnight()
  const arr: DayRecord[] = []
  const days = 118
  for (let i = days; i >= 1; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const r = rand()
    let frac: number
    if (i <= 5) {
      frac = 1.02 + rand() * 0.22
    } else if (r < 0.58) {
      frac = 1.0 + rand() * 0.2
    } else if (r < 0.8) {
      frac = 0.72 + rand() * 0.26
    } else {
      frac = 0.34 + rand() * 0.4
    }
    if (rand() < 0.05 && i > 6) frac = 0.12 + rand() * 0.16
    // a couple of genuinely missed days so the "none" state is visible
    if (i === 9 || i === 23) frac = 0
    const oz = Math.max(0, Math.round(goalOz * frac))
    arr.push({ key: dkey(d), date: d, oz, goal: goalOz, pct: oz / goalOz })
  }
  return arr
}

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
