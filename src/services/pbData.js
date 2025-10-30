import { pb } from './pb.js'

export async function listQuests(userId) {
  const filter = userId ? `user = "${userId}"` : undefined
  return pb.list('quests', { perPage: 200, ...(filter ? { filter } : {}) })
}

export async function listTaskTypes() {
  return pb.list('task_types', { perPage: 200, sort: '+taskType' })
}
