// Launch splash: the AquaDucky wordmark artwork (public/aquaducky-splash.svg)
// springs in, then the screen fades into the app.
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
        background: '#f5f2ee', // matches the AquaDucky artwork's cream paper
        animation: 'splashfade 3.4s ease forwards',
      }}
    >
      <div style={{ animation: 'logospring 1.05s cubic-bezier(.2,.8,.3,1) both', willChange: 'transform' }}>
        <img
          src={`${import.meta.env.BASE_URL}aquaducky-splash.svg`}
          alt="AquaDucky"
          draggable={false}
          style={{ width: 'min(80vw, 360px)', height: 'auto', display: 'block', userSelect: 'none' }}
        />
      </div>
    </div>
  )
}
