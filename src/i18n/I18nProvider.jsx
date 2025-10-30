import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

const messages = {
  en: {
    app: { tagline: 'Work more, gain more.' },
    auth: {
      signInTitle: 'Sign in',
      identity: 'Email or Username',
      password: 'Password',
      signIn: 'Sign in',
      signingIn: 'Signing in…',
      loginFailed: 'Login failed'
    },
    hud: {
      estimatedMoney: 'Estimated Money',
      done: 'Done',
      total: 'Total',
      hint: 'Mark tasks done to increment earnings.'
    },
    rules: { title: 'Rules', view: 'View rules', link: 'Rules', empty: 'No rules yet.' },
    board: {
      currentQuest: 'Current Quest',
      noActiveQuest: 'No quest active now. Create one covering the current date in PocketBase.',
      taskType: 'Task Type',
      placeholderAdd: 'Add a task (e.g., Dishes)',
      tipCreate: 'Tip: Create a Quest active today and at least one Task Type in PocketBase.',
      noTasksYet: 'No tasks yet. Add your first task!'
    },
    task: {
      bonus: 'Bonus',
      bonusTitle: 'Bonus if done without asking',
      delete: 'Delete',
      withoutAsking: 'Without asking',
      penalty: 'Penalty'
    },
    value: { aria: 'Value' },
    actions: { add: 'Add', close: 'Close' },
    fields: { comment: 'Comment (optional)' },
    media: { takePicture: 'Take picture', viewPicture: 'View picture', pictureAlt: 'Task picture' },
    loading: { checkingSession: 'Checking session…' },
    footer: { note: 'Requires PocketBase backend and user login.' }
  },
  fr: {
    app: { tagline: 'Travailler plus pour gagner plus.' },
    auth: {
      signInTitle: 'Connexion',
      identity: 'Email ou nom d’utilisateur',
      password: 'Mot de passe',
      signIn: 'Se connecter',
      signingIn: 'Connexion…',
      loginFailed: 'Échec de la connexion'
    },
    hud: {
      estimatedMoney: 'Gain estimé',
      done: 'Faites',
      total: 'Total',
      hint: 'Marque les tâches faites pour augmenter les gains.'
    },
    rules: { title: 'Règles', view: 'Voir les règles', link: 'Règles', empty: 'Aucune règle pour le moment.' },
    board: {
      currentQuest: 'Quête en cours',
      noActiveQuest: 'Aucune quête active. Crée une quête couvrant la date actuelle dans PocketBase.',
      taskType: 'Type de tâche',
      placeholderAdd: 'Ajouter une tâche (ex. Vaisselle)',
      tipCreate: 'Astuce : crée une quête active aujourd’hui et au moins un type de tâche dans PocketBase.',
      noTasksYet: 'Aucune tâche. Ajoute ta première tâche !'
    },
    task: {
      bonus: 'Bonus',
      bonusTitle: 'Bonus si réalisée sans qu’on te le demande',
      delete: 'Supprimer',
      withoutAsking: 'Sans demander',
      penalty: 'Pénalité'
    },
    value: { aria: 'Valeur' },
    actions: { add: 'Ajouter', close: 'Fermer' },
    fields: { comment: 'Commentaire (optionnel)' },
    media: { takePicture: 'Prendre une photo', viewPicture: 'Voir la photo', pictureAlt: 'Photo de la tâche' },
    loading: { checkingSession: 'Vérification de la session…' },
    footer: {  }
  }
}

const KEY = 'i18n:locale'
const I18nCtx = createContext(null)

function lookup(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj)
}

export function I18nProvider({ children }) {
  const defaultLocale = (() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) return saved
    } catch {}
    const nav = navigator.language || 'en'
    return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en'
  })()
  const [locale, setLocale] = useState(defaultLocale)

  useEffect(() => {
    try { localStorage.setItem(KEY, locale) } catch {}
  }, [locale])

  const t = useMemo(() => (key) => {
    const m = messages[locale] || messages.en
    return lookup(m, key) || lookup(messages.en, key) || key
  }, [locale])

  function fmtDateTime(d) {
    const date = d instanceof Date ? d : new Date(d)
    const datePart = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date)
    const timePart = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit', minute: '2-digit', hour12: locale !== 'fr'
    }).format(date)
    return `${datePart}, ${timePart}`
  }

  function fmtRange(start, end) {
    if (!start) return ''
    const a = fmtDateTime(start)
    const b = end ? fmtDateTime(end) : null
    if (locale === 'fr') {
      return b ? `Du ${a} au ${b}` : `Le ${a}`
    }
    return b ? `From ${a} to ${b}` : a
  }

  const value = useMemo(() => ({ locale, setLocale, t, fmtDateTime, fmtRange }), [locale, setLocale, t])

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

export function useI18n() {
  return useContext(I18nCtx)
}
