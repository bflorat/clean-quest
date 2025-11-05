import React from 'react'

const KEY = 'ui:theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {}
  // Default to dark regardless of system preference
  return 'dark'
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState(getInitialTheme())

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(KEY, theme) } catch {}
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const label = nextTheme === 'dark' ? 'Dark' : 'Light'
  const icon = nextTheme === 'dark' ? '🌙' : '☀️'

  return (
    <button className="pill" onClick={toggle} title={`Switch to ${label} theme`} aria-label={`Switch to ${label} theme`}>
      <span aria-hidden>{icon}</span>
      <span style={{ marginLeft: 6 }}>{label}</span>
    </button>
  )
}
