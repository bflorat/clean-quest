import { pb } from './pb.js'

export function tasksApi() {
  const col = 'tasks'
  return {
    async list({ questId } = {}) {
      const filter = questId ? `quest = "${questId}"` : undefined
      return pb.list(col, { perPage: 200, sort: '-created', ...(filter ? { filter } : {}) })
    },
    async create({ value = 1, finalValue, done = false, doneWithoutAsking = false, comment = '', picture, taskTypeId, questId }) {
      if (!taskTypeId || !questId) throw new Error('taskType and quest are required')
      // Compute persisted finalValue, adding +1 bonus when doneWithoutAsking.
      // Bonus is applied only to non‑negative base values.
      const base = Number(finalValue ?? value)
      let fv = Number.isFinite(base) ? base : 0
      if (doneWithoutAsking && fv >= 0) fv += 1
      if (picture) {
        try {
          console.debug('[tasksApi] picture:', {
            name: picture?.name,
            type: picture?.type,
            size: picture?.size,
          })
        } catch {}
        const fd = new FormData()
        fd.append('finalValue', String(fv))
        fd.append('done', (!!done).toString())
        fd.append('doneWithoutAsking', (!!doneWithoutAsking).toString())
        fd.append('comment', comment ?? '')
        fd.append('taskType', taskTypeId)
        fd.append('quest', questId)
        const fname = picture?.name || (picture?.type === 'image/png' ? 'photo.png' : 'photo.jpg')
        fd.append('picture', picture, fname)
        return pb.create(col, fd)
      }
      return pb.create(col, {
        finalValue: fv,
        done: !!done,
        doneWithoutAsking: !!doneWithoutAsking,
        comment: comment ?? '',
        taskType: taskTypeId,
        quest: questId,
      })
    },
    async update(id, patch) {
      return pb.update(col, id, patch)
    },
    async remove(id) {
      return pb.remove(col, id)
    }
  }
}
