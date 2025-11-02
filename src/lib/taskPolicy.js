import { taskValue } from './taskValue.js'

// Business rule: a regular user cannot delete a negative-valued task.
// Admins can always delete.
export function canDeleteTask(task, { isAdmin = false } = {}) {
  if (isAdmin) return true
  return taskValue(task) >= 0
}

