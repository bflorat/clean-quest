import React from 'react'
import { render, screen } from '@testing-library/react'
import GameHUD from '../components/GameHUD.jsx'
import { I18nProvider } from '../i18n/I18nProvider.jsx'

function fmt(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

describe('GameHUD estimated money', () => {
  function renderHUD(tasks, quest = { unit: '€' }) {
    return render(
      <I18nProvider>
        <GameHUD tasks={tasks} quest={quest} />
      </I18nProvider>
    )
  }

  it('sums values using finalValue or taskType default', () => {
    const types = [
      { id: 't1', defaultValue: 5 },
      { id: 't2', defaultValue: 10 },
    ]
    const tasks = [
      { id: 'a', taskType: 't1', done: true },                 // uses default 5
      { id: 'b', finalValue: 4, taskType: 't1', done: true },  // uses finalValue 4
      { id: 'c', taskType: 't2', done: false },                // uses default 10 (MVP includes all)
    ]
    const expected = 5 + 4 + 10
    render(
      <I18nProvider>
        <GameHUD tasks={tasks} quest={{ unit: '€' }} types={types} />
      </I18nProvider>
    )
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })

  it('includes negative finalValue penalties in the sum', () => {
    const tasks = [
      { id: 'a', finalValue: 10, done: true },
      { id: 'b', finalValue: -2, done: true },
    ]
    const expected = 8
    renderHUD(tasks, { unit: '€' })
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })

  it('parses string finalValues gracefully', () => {
    const tasks = [
      { id: 'a', finalValue: '7', done: true },
      { id: 'b', finalValue: '3.5', done: true },
      { id: 'c', finalValue: '0', done: true },
    ]
    const expected = 10.5
    renderHUD(tasks, { unit: '€' })
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })
  it('uses finalValue 0 when explicitly set', () => {
    const types = [
      { id: 'tt1', taskType: 'A', defaultValue: 5 },
      { id: 'tt2', taskType: 'B', defaultValue: -2 },
    ]
    const tasks = [
      { id: 'a', finalValue: 0, taskType: 'tt1' }, // uses 0, not fallback
      { id: 'b', taskType: 'tt2' },               // uses default -2
    ]
    const expected = 0 + -2
    render(
      <I18nProvider>
        <GameHUD tasks={tasks} types={types} quest={{ unit: '€' }} />
      </I18nProvider>
    )
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })
})
