// AquaDucky type + colour system.
//
// The look follows the hand-drawn AquaDucky logo: a warm cream/paper canvas,
// deep-blue ink, a friendly azure-blue accent (the "Aqua"), and a sunny amber
// (the "Ducky"). Typography is rounded and playful to echo the marker wordmark.

// Rounded display face (headings, big numbers) — Fredoka mirrors the bubbly wordmark.
export const DISPLAY = "'Fredoka','Baloo 2',system-ui,-apple-system,sans-serif"
// Rounded body face — Nunito pairs cleanly with Fredoka.
export const BODY = "'Nunito',system-ui,-apple-system,'Segoe UI',sans-serif"

// ---- palette ----
export const C = {
  // paper background — sampled from the hand-drawn ducky artwork's paper so the
  // hero/splash images blend seamlessly into the screen (no visible square)
  paper: '#eeeae7',
  paperGrad: 'radial-gradient(130% 95% at 50% 2%, #f1edea 0%, #eeeae7 55%, #e8e3dd 100%)',

  // ink (text)
  ink: '#173a5e', // primary — deep blue, like the wordmark outline
  ink2: '#51687e', // secondary
  mute: '#8a97a4', // tertiary / labels

  // azure accent ("Aqua")
  blue: '#2f8fd6',
  blueDeep: '#1f6fb8',
  blueGrad: 'linear-gradient(180deg,#5cb6ef,#2f8fd6)',
  waterGrad: 'linear-gradient(180deg,#7cc6ff 0%,#3f9bef 38%,#2f8fd6 78%,#1f6fb8 100%)',

  // amber accent ("Ducky" + the duck)
  amber: '#f5a623',
  amberDeep: '#c9790a',
  goldGrad: 'linear-gradient(180deg,#ffd979,#f4b427)',

  // success green (goal met)
  greenGrad: 'linear-gradient(155deg,#3fce9c,#1f9e85)',
  green: '#1f9e85',
  greenInk: '#05402e',

  // surfaces
  card: '#ffffff',
  cardWarm: '#fdfbf6',
  border: 'rgba(23,58,94,0.12)',
  borderSoft: 'rgba(23,58,94,0.08)',
  hair: 'rgba(23,58,94,0.10)',
  cardShadow: '0 6px 20px rgba(120,104,72,0.10)',

  // scrim behind modals/sheets
  scrim: 'rgba(28,38,58,0.42)',
}

// Soft-feather for the hand-drawn artwork images: fade all four edges a few
// percent so the paper background melts into the page (no visible square).
const EDGE = '#000 0, #000 92%, transparent 100%'
export const FEATHER = {
  WebkitMaskImage: `linear-gradient(to top, ${EDGE}), linear-gradient(to bottom, ${EDGE}), linear-gradient(to left, ${EDGE}), linear-gradient(to right, ${EDGE})`,
  WebkitMaskComposite: 'source-in',
  maskImage: `linear-gradient(to top, ${EDGE}), linear-gradient(to bottom, ${EDGE}), linear-gradient(to left, ${EDGE}), linear-gradient(to right, ${EDGE})`,
  maskComposite: 'intersect',
} as const
