// Circular "x" close button, pinned to the top-right of a pop-up/card.
// The parent must be position:relative (or absolute).
export function CloseButton({ onClick, top = 12, right = 14 }: { onClick: () => void; top?: number; right?: number }) {
  return (
    <button
      className="press"
      onClick={onClick}
      aria-label="Close"
      style={{
        position: 'absolute',
        top,
        right,
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '1px solid rgba(23,58,94,0.14)',
        background: 'rgba(23,58,94,0.06)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        zIndex: 6,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#51687e" strokeWidth="2.4" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}
