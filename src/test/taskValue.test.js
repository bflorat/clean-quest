import { describe, it, expect } from 'vitest'
import { taskValue } from '../lib/taskValue.js'

describe('taskValue()', () => {
  it('prefers finalValue over value', () => {
    expect(taskValue({ value: 2, finalValue: 3 })).toBe(3)
  })
  it('supports snake_case variants', () => {
    expect(taskValue({ final_value: 4 })).toBe(4)
    expect(taskValue({ finalvalue: 5 })).toBe(5)
  })
  it('parses strings and commas', () => {
    expect(taskValue({ finalValue: '3.5' })).toBeCloseTo(3.5)
    expect(taskValue({ value: '2,25' })).toBeCloseTo(2.25)
  })
  it('falls back to 0 for invalid', () => {
    expect(taskValue({ finalValue: 'oops' })).toBe(0)
  })
})

