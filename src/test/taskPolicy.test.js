import { describe, it, expect } from 'vitest'
import { canDeleteTask } from '../lib/taskPolicy.js'

describe('canDeleteTask()', () => {
  it('allows admin to delete any task', () => {
    expect(canDeleteTask({ finalValue: -5 }, { isAdmin: true })).toBe(true)
    expect(canDeleteTask({ finalValue: 0 }, { isAdmin: true })).toBe(true)
  })
  it('blocks regular user from deleting negative tasks', () => {
    expect(canDeleteTask({ finalValue: -1 }, { isAdmin: false })).toBe(false)
    expect(canDeleteTask({ value: '-2' }, { isAdmin: false })).toBe(false)
  })
  it('allows regular user to delete non-negative tasks', () => {
    expect(canDeleteTask({ finalValue: 0 }, { isAdmin: false })).toBe(true)
    expect(canDeleteTask({ value: 3 }, { isAdmin: false })).toBe(true)
  })
})

