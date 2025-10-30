import { describe, it, expect } from 'vitest'
import { isDoneWithoutAsking } from '../lib/taskFlags.js'

describe('isDoneWithoutAsking', () => {
  it('detects boolean true', () => {
    expect(isDoneWithoutAsking({ doneWithoutAsking: true })).toBe(true)
  })

  it('detects string "true" and "1"', () => {
    expect(isDoneWithoutAsking({ doneWithoutAsking: 'true' })).toBe(true)
    expect(isDoneWithoutAsking({ doneWithoutAsking: '1' })).toBe(true)
  })

  it('detects number 1', () => {
    expect(isDoneWithoutAsking({ doneWithoutAsking: 1 })).toBe(true)
  })

  it('detects snake_case key', () => {
    expect(isDoneWithoutAsking({ done_without_asking: true })).toBe(true)
  })

  it('returns false for falsy values', () => {
    expect(isDoneWithoutAsking({})).toBe(false)
    expect(isDoneWithoutAsking({ doneWithoutAsking: false })).toBe(false)
    expect(isDoneWithoutAsking({ doneWithoutAsking: 0 })).toBe(false)
    expect(isDoneWithoutAsking({ doneWithoutAsking: 'false' })).toBe(false)
  })
})

