import React, { useMemo } from 'react'
import { useI18n } from '../i18n/I18nProvider.jsx'

export default function GameHUD({ tasks, quest }) {
  const { t } = useI18n()
  const stats = useMemo(() => {
    // All added tasks are considered done in this MVP
    const money = (tasks || []).reduce((sum, t) => {
      const raw = (t.finalValue ?? t.value ?? 0)
      const n = typeof raw === 'string' ? parseFloat(raw) : Number(raw || 0)
      return sum + (isNaN(n) ? 0 : n)
    }, 0)
    return { money, doneCount: (tasks || []).length, total: (tasks || []).length }
  }, [tasks])

  const fmt = (n) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)

  return (
    <div className="hud">
      <div className="hud__card">
        <div className="hud__level">{t('board.currentQuest')}</div>
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
