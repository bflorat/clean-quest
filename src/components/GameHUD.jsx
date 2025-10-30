import React, { useMemo, useState, useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { effectiveTaskValue } from '../lib/taskValue.js'

export default function GameHUD({ tasks, quest, types = [], quests = [] }) {
  const { t } = useI18n()
  const [showRules, setShowRules] = useState(false)
  const stats = useMemo(() => {
    // All added tasks are considered done in this MVP
    const money = (tasks || []).reduce((sum, t) => sum + effectiveTaskValue(t, types), 0)
    return { money, doneCount: (tasks || []).length, total: (tasks || []).length }
  }, [tasks, types])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setShowRules(false) }
    if (showRules) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showRules])

  const fmt = (n) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)

  function hasRules(html) {
    const s = String(html || '')
    const text = s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    return text.length > 0
  }

  const rulesHtml = useMemo(() => {
    // if current quest has rules, use them
    if (hasRules(quest?.rules)) return String(quest.rules)
    // otherwise, look for previous quests (by start desc) and pick first with rules
    const arr = Array.isArray(quests) ? quests.slice() : []
    arr.sort((a, b) => new Date(b?.start || 0) - new Date(a?.start || 0))
    const idx = quest?.id ? arr.findIndex(q => q?.id === quest.id) : -1
    if (idx >= 0) {
      for (let i = idx + 1; i < arr.length; i++) {
        if (hasRules(arr[i]?.rules)) return String(arr[i].rules)
      }
    } else {
      const now = Date.now()
      for (let i = 0; i < arr.length; i++) {
        const start = arr[i]?.start ? new Date(arr[i].start).getTime() : 0
        if (start <= now && hasRules(arr[i]?.rules)) return String(arr[i].rules)
      }
    }
    return ''
  }, [quest?.id, quest?.rules, quests])

  return (
    <div className="hud">
      <div className="hud__card">
        <div className="hud__row" style={{ justifyContent: 'space-between' }}>
          <div className="hud__level">{t('board.currentQuest')}</div>
          <button
            className="link"
            onClick={() => setShowRules(true)}
            aria-label={t('rules.view')}
            title={t('rules.view')}
          >
            {t('rules.link')}
          </button>
        </div>
        <div className="hud__meta">
          {quest ? (
            // localized range like "Du 10 octobre 2025, 14:00 au 15 octobre 2025, 13:00"
            <QuestRange quest={quest} />
          ) : null}
        </div>
      </div>
      <div className="hud__card">
        <div className="hud__level">{t('hud.estimatedMoney')}</div>
        <div className="hud__xp" aria-label="estimated-money">€ {fmt(stats.money)}</div>       
      </div>

      {showRules ? (
        <div className="drawerBackdrop" onClick={() => setShowRules(false)}>
          <div className="drawer" role="dialog" aria-modal="true" aria-label={t('rules.title')} onClick={(e) => e.stopPropagation()}>
            <div className="drawerHeader">
              <div className="drawerTitle">{t('rules.title')}</div>
              <button className="drawerClose" onClick={() => setShowRules(false)} aria-label={t('actions.close')} title={t('actions.close')}>×</button>
            </div>
            {hasRules(rulesHtml) ? (
              <div className="drawerContent" dangerouslySetInnerHTML={{ __html: rulesHtml }} />
            ) : (
              <div className="drawerContent muted">{t('rules.empty')}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function QuestRange({ quest }) {
  const { fmtDateTime, locale } = useI18n()
  const fromLbl = locale === 'fr' ? 'Du' : 'From'
  const toLbl = locale === 'fr' ? 'au' : 'to'
  const start = quest?.start ? fmtDateTime(quest.start) : ''
  const end = quest?.end ? fmtDateTime(quest.end) : ''
  return (
    <div className="questDates">
      {start ? <div className="questDate">{fromLbl} {start}</div> : null}
      {end ? <div className="questDate">{toLbl} {end}</div> : null}
    </div>
  )
}
