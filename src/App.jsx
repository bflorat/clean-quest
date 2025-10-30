import React from 'react'
import TaskBoard from './components/TaskBoard.jsx'
import Login from './components/Login.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import { userAvatarUrl } from './services/pb.js'
import { useI18n } from './i18n/I18nProvider.jsx'
import LangSwitcher from './components/LangSwitcher.jsx'
import './App.css'

export default function App() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <img src="/logo.svg" alt="Clean Quest logo" width="32" height="32" />
          <h1>Clean Quest</h1>
        </div>
        {user ? (
          <div className="userbar" title={user.email || user.username || user.name}>
            <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>
              {user.name || user.username || user.email}
            </span>
            <img className="avatar" src={userAvatarUrl(user, { thumb: '128x128' })} alt="User avatar" />
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
        <LangSwitcher />
      </footer>
    </div>
  )
}
