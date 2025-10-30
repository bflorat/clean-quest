import React from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'

export default function LangSwitcher() {
  const { locale, setLocale } = useI18n()
  return (
    <div className="lang">
      <label className="sr-only" htmlFor="lang-select">Language</label>
      <select
        id="lang-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label="Language"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  )
}
