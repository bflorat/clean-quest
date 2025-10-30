export function isDoneWithoutAsking(task) {
  const v = task?.doneWithoutAsking ?? task?.done_without_asking ?? task?.donewithoutasking
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1'
  if (typeof v === 'number') return v === 1
  return !!v
}

