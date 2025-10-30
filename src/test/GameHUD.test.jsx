import React from 'react'
import { render, screen } from '@testing-library/react'
import GameHUD from '../components/GameHUD.jsx'
import { I18nProvider } from '../i18n/I18nProvider.jsx'

function fmt(n) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

describe('GameHUD estimated money', () => {
  function renderHUD(tasks) {
    return render(
      <I18nProvider>
        <GameHUD tasks={tasks} />
      </I18nProvider>
    )
  }

  it('sums values of tasks (uses finalValue when present)', () => {
    const tasks = [
      { id: 'a', description: 'A', value: 5, done: true },
      { id: 'b', description: 'B', value: 3, finalValue: 4, done: true }, // finalValue wins
      { id: 'c', description: 'C', value: 10, done: false }, // in MVP, all tasks are considered
    ]
    const expected = 5 + 4 + 10
    renderHUD(tasks)
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })

  it('includes negative values as penalties in the sum', () => {
    const tasks = [
      { id: 'a', description: 'A', value: 10, done: true },
      { id: 'b', description: 'B', value: -2, done: true },
    ]
    const expected = 8
    renderHUD(tasks)
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })

  it('parses string values gracefully', () => {
    const tasks = [
      { id: 'a', description: 'A', value: '7', done: true },
      { id: 'b', description: 'B', finalValue: '3.5', done: true },
      { id: 'c', description: 'C', value: 'oops', done: true }, // ignored as NaN
    ]
    const expected = 10.5
    renderHUD(tasks)
    const money = screen.getByLabelText('estimated-money')
    expect(money).toHaveTextContent(`€ ${fmt(expected)}`)
  })
})
