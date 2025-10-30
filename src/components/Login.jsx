import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'

export default function Login() {
  const { login } = useAuth()
  const { t } = useI18n()
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(identity, password)
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>{t('auth.signInTitle')}</h2>
      <form className="authform" onSubmit={submit} aria-label="login">
        <label>
          <span>{t('auth.identity')}</span>
          <input value={identity} onChange={e => setIdentity(e.target.value)} required />
        </label>
        <label>
          <span>{t('auth.password')}</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? t('auth.signingIn') : t('auth.signIn')}</button>
        {error ? <div className="error" role="alert">{t('auth.loginFailed')}</div> : null}
      </form>
    </div>
  )
}
