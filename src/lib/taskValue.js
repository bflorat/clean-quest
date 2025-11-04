export function rawTaskValue(task) {
  if (!task || typeof task !== 'object') return 0
  const pairs = [
    ['finalValue', task.finalValue],
    ['final_value', task.final_value],
    ['finalvalue', task.finalvalue],
    ['value', task.value],
    ['val', task.val],
  ]
  for (const [k, v] of pairs) {
    if (v !== undefined && v !== null && v !== '') return v
  }
  return 0
}

export function toNumber(v) {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const s = v.trim().replace(',', '.')
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : 0
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function taskValue(task) {
  return toNumber(rawTaskValue(task))
}

export function taskValueWithSource(task) {
  if (!task || typeof task !== 'object') return { value: 0, source: 'none' }
  const pairs = [
    ['finalValue', task.finalValue],
    ['final_value', task.final_value],
    ['finalvalue', task.finalvalue],
    ['value', task.value],
    ['val', task.val],
  ]
  for (const [k, v] of pairs) {
    if (v !== undefined && v !== null && v !== '') return { value: toNumber(v), source: k }
  }
  return { value: 0, source: 'none' }
}

// Returns effective value for a task, falling back to its task type defaultValue
// when missing or equal to 0.
export function effectiveTaskValue(task, types = []) {
  const { present, value } = readFinalValue(task)
  if (present) return value
  const typeId = task?.taskType
  const tt = Array.isArray(types) ? types.find(t => t?.id === typeId) : null
  return toNumber(tt?.defaultValue ?? 0)
}

// Reads the task finalValue in a tolerant way (different casings/keys).
// Returns { present: boolean, value: number }
export function readFinalValue(task) {
  if (!task || typeof task !== 'object') return { present: false, value: 0 }
  const keys = ['finalValue', 'final_value', 'finalvalue']
  for (const k of keys) {
    const v = task[k]
    if (v !== undefined && v !== null && v !== '') {
      return { present: true, value: toNumber(v) }
    }
  }
  return { present: false, value: 0 }
}
