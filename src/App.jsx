import React from 'react'
import TaskBoard from './components/TaskBoard.jsx'
import Login from './components/Login.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import { userAvatarUrl } from './services/pb.js'
import { useI18n } from './i18n/I18nProvider.jsx'
import LangSwitcher from './components/LangSwitcher.jsx'
import './App.css'

export default function App() {
  const { user, loading, logout } = useAuth()
  const { t } = useI18n()
  const version = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '')
  const [menuOpen, setMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef(null)

  React.useEffect(() => {
    function onDoc(e) {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])
  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <img src="/logo.svg" alt="Clean Quest logo" width="32" height="32" />
          <h1>Clean Quest</h1>
        </div>
        {user ? (
          <div ref={userMenuRef} className="userbarContainer">
          <div
            className="userbar clickable"
            title={user.email || user.username || user.name}
            role="button"
            tabIndex={0}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(s => !s)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenuOpen(s => !s) } }}
          >
            <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
              {user.name || user.username || user.email}
            </span>
            <img
              className="avatar"
              src={userAvatarUrl(user, { thumb: '128x128' })}
              alt="User avatar"
              aria-hidden="true"
            />
          </div>
          {menuOpen ? (
            <div className="userMenu" role="menu" aria-label={t('auth.accountMenu')}>
              <button className="userMenu__item" role="menuitem" onClick={logout}>{t('auth.logout')}</button>
            </div>
          ) : null}
          </div>
        ) : null}
        <p className="tagline">{t('app.tagline')}</p>
      </header>
      <main className="app__main">
        {loading ? (
          <p className="muted">{t('loading.checkingSession')}</p>
        ) : user ? (
          <TaskBoard />
        ) : (
          <Login />
        )}
      </main>
      <footer className="app__footer">
        <small>Copyright (C) 2025, Bertrand Florat</small>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {version ? <small className="muted" title="App version">v{version}</small> : null}
          <LangSwitcher />
        </div>
      </footer>
    </div>
  )
}
