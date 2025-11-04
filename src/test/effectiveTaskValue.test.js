import { describe, it, expect } from 'vitest'
import { effectiveTaskValue } from '../lib/taskValue.js'

describe('effectiveTaskValue()', () => {
  const types = [
    { id: 't1', defaultValue: 3 },
    { id: 't2', defaultValue: -1 },
  ]

  it('returns finalValue when present (even 0)', () => {
    expect(effectiveTaskValue({ finalValue: -5, taskType: 't1' }, types)).toBe(-5)
    expect(effectiveTaskValue({ finalValue: 0, taskType: 't2' }, types)).toBe(0)
  })

  it('falls back to defaultValue when finalValue is missing (ignores value)', () => {
    expect(effectiveTaskValue({ value: 2, taskType: 't1' }, types)).toBe(3)
    expect(effectiveTaskValue({ taskType: 't1' }, types)).toBe(3)
  })
})
