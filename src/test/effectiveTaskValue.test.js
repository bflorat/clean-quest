import { describe, it, expect } from 'vitest'
import { effectiveTaskValue } from '../lib/taskValue.js'

describe('effectiveTaskValue()', () => {
  const types = [
    { id: 't1', defaultValue: 3 },
    { id: 't2', defaultValue: -1 },
  ]

  it('returns non-zero explicit values', () => {
    expect(effectiveTaskValue({ value: 2, taskType: 't1' }, types)).toBe(2)
    expect(effectiveTaskValue({ finalValue: -5, taskType: 't1' }, types)).toBe(-5)
  })

  it('falls back to defaultValue when value is 0 or missing', () => {
    expect(effectiveTaskValue({ value: 0, taskType: 't1' }, types)).toBe(3)
    expect(effectiveTaskValue({ finalValue: 0, taskType: 't2' }, types)).toBe(-1)
    expect(effectiveTaskValue({ taskType: 't1' }, types)).toBe(3)
  })
})

