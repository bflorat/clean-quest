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
  const { value: tv, source } = taskValueWithSource(task)
  // Prefer explicit non-zero value
  if (Number.isFinite(tv) && tv !== 0) return tv
  // Otherwise fallback to taskType.defaultValue
  const typeId = task?.taskType
  const tt = Array.isArray(types) ? types.find(t => t?.id === typeId) : null
  return toNumber(tt?.defaultValue ?? 0)
}
