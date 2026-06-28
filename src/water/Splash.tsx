import { DuckCup } from './DuckCup'

// Launch splash: the AquaDucky scene (the logo, minus the wordmark) springs in
// with a full cup, then the screen fades into the app.
export function Splash() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f2ee', // matches the AquaDucky logo's cream paper
        animation: 'splashfade 3.4s ease forwards',
      }}
    >
      <div style={{ animation: 'logospring 1.05s cubic-bezier(.2,.8,.3,1) both', willChange: 'transform' }}>
        <DuckCup fill={1} width={300} />
      </div>
    </div>
  )
}
