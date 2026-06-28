import { useEffect, useRef, useState, type CSSProperties } from 'react'

// A number that you can click to type into. Steppers update `value` from the
// outside; typing commits (clamped) on blur or Enter.
export function NumberField({
  value,
  min,
  max,
  onChange,
  style,
  width,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  style?: CSSProperties
  width?: number | string
}) {
  const [text, setText] = useState(String(value))
  const editing = useRef(false)

  useEffect(() => {
    if (!editing.current) setText(String(value))
  }, [value])

  const commit = () => {
    editing.current = false
    const n = parseInt(text, 10)
    const clamped = Number.isNaN(n) ? value : Math.max(min, Math.min(max, n))
    onChange(clamped)
    setText(String(clamped))
  }

  return (
    <input
      value={text}
      inputMode="numeric"
      onFocus={(e) => {
        editing.current = true
        e.currentTarget.select()
      }}
      onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      style={{
        width: width ?? '2.2ch',
        textAlign: 'center',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        padding: 0,
        color: 'inherit',
        font: 'inherit',
        fontVariantNumeric: 'tabular-nums',
        cursor: 'text',
        ...style,
      }}
    />
  )
}
