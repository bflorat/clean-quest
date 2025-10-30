import { pb } from './pb.js'

export function tasksApi() {
  const col = 'tasks'
  return {
    async list({ questId } = {}) {
      const filter = questId ? `quest = "${questId}"` : undefined
      return pb.list(col, { perPage: 200, sort: '-created', ...(filter ? { filter } : {}) })
    },
    async create({ description, value = 1, finalValue, done = false, doneWithoutAsking = false, comment = '', picture, taskTypeId, questId }) {
      if (!taskTypeId || !questId) throw new Error('taskType and quest are required')
      const fv = Number(finalValue ?? value) || 0
      if (picture) {
        try {
          console.debug('[tasksApi] picture:', {
            name: picture?.name,
            type: picture?.type,
            size: picture?.size,
          })
        } catch {}
        const fd = new FormData()
        fd.append('description', description ?? '')
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
        description: description ?? '',
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
