import React, { useEffect, useRef, useState } from 'react'

export default function TaskTypeSelect({ types, value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const selected = types.find((t) => t.id === value)

  useEffect(() => {
    function onDoc(e) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [])

  const select = (id) => {
    onChange && onChange(id)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={`select ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((s) => !s)}
        disabled={disabled}
        title={selected?.taskType || ''}
      >
        <span className="select__label">{selected?.taskType || '—'}</span>
        <span className="select__chev">▾</span>
      </button>
      {open && (
        <div className="select__menu" role="listbox" aria-activedescendant={value || ''}>
          {types.map((t) => (
            <div
              key={t.id}
              role="option"
              aria-selected={t.id === value}
              className={`select__option ${t.id === value ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); select(t.id) }}
              title={t.comment || t.taskType}
            >
              {t.taskType}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

