/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  const dao = new Dao(db)

  // task_types: readable by authenticated users
  {
    const col = dao.findCollectionByNameOrId('task_types')
    if (col) {
      col.listRule = '@request.auth.id != ""'
      col.viewRule = '@request.auth.id != ""'
      dao.saveCollection(col)
    }
  }

  // quests: only owner can list/view/create/update/delete
  {
    const col = dao.findCollectionByNameOrId('quests')
    if (col) {
      col.listRule = 'user = @request.auth.id'
      col.viewRule = 'user = @request.auth.id'
      col.createRule = '@request.data.user = @request.auth.id'
      col.updateRule = 'user = @request.auth.id'
      col.deleteRule = 'user = @request.auth.id'
      dao.saveCollection(col)
    }
  }

  // tasks: restricted via related quest ownership
  {
    const col = dao.findCollectionByNameOrId('tasks')
    if (col) {
      col.listRule = 'quest.user = @request.auth.id'
      col.viewRule = 'quest.user = @request.auth.id'
      col.createRule = '@request.data.quest.user = @request.auth.id'
      col.updateRule = 'quest.user = @request.auth.id'
      col.deleteRule = 'quest.user = @request.auth.id'
      dao.saveCollection(col)
    }
  }

  // payments: restricted via related quest ownership
  {
    const col = dao.findCollectionByNameOrId('payments')
    if (col) {
      col.listRule = 'quest.user = @request.auth.id'
      col.viewRule = 'quest.user = @request.auth.id'
      col.createRule = '@request.data.quest.user = @request.auth.id'
      col.updateRule = 'quest.user = @request.auth.id'
      col.deleteRule = 'quest.user = @request.auth.id'
      dao.saveCollection(col)
    }
  }

  // no explicit return
}, (db) => {
  const dao = new Dao(db)
  const names = ['task_types', 'quests', 'tasks', 'payments']
  for (const n of names) {
    const col = dao.findCollectionByNameOrId(n)
    if (col) {
      col.listRule = null
      col.viewRule = null
      col.createRule = null
      col.updateRule = null
      col.deleteRule = null
      dao.saveCollection(col)
    }
  }
})

