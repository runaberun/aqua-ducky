// A short, fun "you hit your goal!" audio cue, synthesized with the Web Audio
// API so it needs no asset file: two quick duck-ish quacks, a rising chime,
// and a best-effort high-pitched "Oh yeah!" via the speech synthesizer.
//
// Browsers only allow audio after a user gesture, so primeAudio() is called
// from the tap that logs a drink; playGoalCue() then plays when the goal is hit.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

// Call from a user gesture so the AudioContext is unlocked.
export function primeAudio(): void {
  getCtx()
}

export function playGoalCue(): void {
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime

  // two quick "quacks": a sawtooth with a fast downward pitch bend through a
  // bandpass, which reads as a cartoonish duck.
  const quack = (start: number, f0: number, f1: number) => {
    const o = c.createOscillator()
    o.type = 'sawtooth'
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1100
    bp.Q.value = 5
    const g = c.createGain()
    o.frequency.setValueAtTime(f0, start)
    o.frequency.exponentialRampToValueAtTime(f1, start + 0.12)
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(0.45, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
    o.connect(bp)
    bp.connect(g)
    g.connect(c.destination)
    o.start(start)
    o.stop(start + 0.2)
  }
  quack(t0, 860, 420)
  quack(t0 + 0.17, 780, 380)

  // rising celebratory chime (C–E–G–C)
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const start = t0 + 0.42 + i * 0.1
    const o = c.createOscillator()
    o.type = 'triangle'
    const g = c.createGain()
    o.frequency.value = f
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(0.33, start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)
    o.connect(g)
    g.connect(c.destination)
    o.start(start)
    o.stop(start + 0.32)
  })

  // best-effort silly "Oh yeah!" — skipped silently if unavailable
  try {
    const ss = window.speechSynthesis
    if (ss) {
      const u = new SpeechSynthesisUtterance('Oh yeah!')
      u.pitch = 1.8
      u.rate = 1.05
      u.volume = 0.9
      ss.cancel()
      ss.speak(u)
    }
  } catch {
    /* no speech synth — the chime is enough */
  }
}
