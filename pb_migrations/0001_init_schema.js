/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  // task_types
  const taskTypes = new Collection({
    name: 'task_types',
    type: 'base',
    system: false,
    schema: [
      new SchemaField({
        system: false,
        id: 'tt_taskType',
        name: 'taskType',
        type: 'text',
        required: true,
        unique: true,
        options: { min: null, max: null, pattern: '' }
      }),
      new SchemaField({
        system: false,
        id: 'tt_defaultValue',
        name: 'defaultValue',
        type: 'number',
        required: false,
        unique: false,
        options: { min: null, max: null, noDecimal: false }
      }),
      new SchemaField({
        system: false,
        id: 'tt_comment',
        name: 'comment',
        type: 'text',
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: '' }
      })
    ],
    indexes: [
      'CREATE UNIQUE INDEX `idx_task_types_taskType` ON `task_types` (`taskType`)'
    ],
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: null,
    updateRule: null,
    deleteRule: null,
    options: {}
  })
  dao.saveCollection(taskTypes)
  // quests
  const quests = new Collection({
    name: 'quests',
    type: 'base',
    system: false,
    schema: [
      new SchemaField({
        system: false,
        id: 'q_start',
        name: 'start',
        type: 'date',
        required: true,
        unique: false,
        options: { min: null, max: null }
      }),
      new SchemaField({
        system: false,
        id: 'q_end',
        name: 'end',
        type: 'date',
        required: false,
        unique: false,
        options: { min: null, max: null }
      }),
      new SchemaField({
        system: false,
        id: 'q_rules',
        name: 'rules',
        type: 'editor',
        required: false,
        unique: false,
        options: {}
      })
    ],
    indexes: [],
    listRule: 'user = @request.auth.id',
    viewRule: 'user = @request.auth.id',
    createRule: '@request.data.user = @request.auth.id',
    updateRule: 'user = @request.auth.id',
    deleteRule: 'user = @request.auth.id',
    options: {}
  })
  dao.saveCollection(quests)
  // tasks (relations added after ids exist)
  const tasks = new Collection({
    name: 'tasks',
    type: 'base',
    system: false,
    schema: [
      new SchemaField({
        system: false,
        id: 't_description',
        name: 'description',
        type: 'text',
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: '' }
      }),
      new SchemaField({
        system: false,
        id: 't_finalValue',
        name: 'finalValue',
        type: 'number',
        required: false,
        unique: false,
        options: { min: null, max: null, noDecimal: false }
      }),
      new SchemaField({
        system: false,
        id: 't_done',
        name: 'done',
        type: 'bool',
        required: false,
        unique: false,
        options: {}
      }),
      new SchemaField({
        system: false,
        id: 't_doneWithoutAsking',
        name: 'doneWithoutAsking',
        type: 'bool',
        required: false,
        unique: false,
        options: {}
      }),
      new SchemaField({
        system: false,
        id: 't_comment',
        name: 'comment',
        type: 'text',
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: '' }
      }),
      new SchemaField({
        system: false,
        id: 't_picture',
        name: 'picture',
        type: 'file',
        required: false,
        unique: false,
        options: {
          maxSelect: 1,
          maxSize: 204800,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          thumbs: [],
          protected: false
        }
      })
    ],
    indexes: [],
    listRule: 'quest.user = @request.auth.id',
    viewRule: 'quest.user = @request.auth.id',
    createRule: '@request.data.quest.user = @request.auth.id',
    updateRule: 'quest.user = @request.auth.id',
    deleteRule: 'quest.user = @request.auth.id',
    options: {}
  })
  dao.saveCollection(tasks)
  // payments (relation added after ids exist)
  const payments = new Collection({
    name: 'payments',
    type: 'base',
    system: false,
    schema: [
      new SchemaField({
        system: false,
        id: 'p_datePayment',
        name: 'datePayment',
        type: 'date',
        required: false,
        unique: false,
        options: { min: null, max: null }
      }),
      new SchemaField({
        system: false,
        id: 'p_comment',
        name: 'comment',
        type: 'text',
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: '' }
      })
    ],
    indexes: [],
    listRule: 'quest.user = @request.auth.id',
    viewRule: 'quest.user = @request.auth.id',
    createRule: '@request.data.quest.user = @request.auth.id',
    updateRule: 'quest.user = @request.auth.id',
    deleteRule: 'quest.user = @request.auth.id',
    options: {}
  })
  dao.saveCollection(payments)
  // fetch created collections to use their IDs in relations
  const taskTypesCol = dao.findCollectionByNameOrId('task_types')
  const questsCol = dao.findCollectionByNameOrId('quests')
  const tasksCol = dao.findCollectionByNameOrId('tasks')
  const paymentsCol = dao.findCollectionByNameOrId('payments')
  // tasks.taskType -> task_types (single)
  tasksCol.schema.addField(
    new SchemaField({
      system: false,
      id: 't_taskType_rel',
      name: 'taskType',
      type: 'relation',
      required: true,
      unique: false,
      options: {
        collectionId: taskTypesCol.id,
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: null
      }
    })
  )
  // tasks.quest -> quests (single)
  tasksCol.schema.addField(
    new SchemaField({
      system: false,
      id: 't_quest_rel',
      name: 'quest',
      type: 'relation',
      required: true,
      unique: false,
      options: {
        collectionId: questsCol.id,
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: null
      }
    })
  )
  dao.saveCollection(tasksCol)
  // payments.quest -> quests (single, optional, unique)
  paymentsCol.schema.addField(
    new SchemaField({
      system: false,
      id: 'p_quest_rel',
      name: 'quest',
      type: 'relation',
      required: false,
      unique: false,
      options: {
        collectionId: questsCol.id,
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: null
      }
    })
  )
  paymentsCol.indexes = [
    ...(paymentsCol.indexes || []),
    'CREATE UNIQUE INDEX `idx_payments_quest_unique` ON `payments` (`quest`)'
  ]
  dao.saveCollection(paymentsCol)
  // quests.user -> users (single, required)
  questsCol.schema.addField(
    new SchemaField({
      system: false,
      id: 'q_user_rel',
      name: 'user',
      type: 'relation',
      required: true,
      unique: false,
      options: {
        collectionId: '_pb_users_auth_',
        cascadeDelete: false,
        minSelect: null,
        maxSelect: 1,
        displayFields: null
      }
    })
  )
  dao.saveCollection(questsCol)
  // no explicit return
}, (db) => {
  const dao = new Dao(db)
  const collections = ['payments', 'tasks', 'task_types', 'quests']
  for (const name of collections) {
    const c = dao.findCollectionByNameOrId(name)
    if (c) {
      dao.deleteCollection(c)
    }
  }
  // no explicit return
})
