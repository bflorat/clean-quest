import React, { useEffect, useMemo, useState } from 'react'
import { tasksApi } from '../services/tasks.js'
import { listQuests, listTaskTypes } from '../services/pbData.js'
import ConfettiBurst from './ConfettiBurst.jsx'
import { useSound } from '../hooks/useSound.js'
import GameHUD from './GameHUD.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { isDoneWithoutAsking } from '../lib/taskFlags.js'
import TaskTypeSelect from './TaskTypeSelect.jsx'

export default function TaskBoard() {
  const api = useMemo(() => tasksApi(), [])
  const { success } = useSound()
  const { user } = useAuth()
  const { t, fmtDateTime } = useI18n()
  const [tasks, setTasks] = useState([])
  const [celebrate, setCelebrate] = useState(false)
  const [quests, setQuests] = useState([])
  const [activeQuest, setActiveQuest] = useState('')
  const [types, setTypes] = useState([])
  const [activeType, setActiveType] = useState('')
  const [newDoneWA, setNewDoneWA] = useState(false)
  const [lastAddedAt, setLastAddedAt] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [pictureFile, setPictureFile] = useState(null)
  const fileInputRef = React.useRef(null)

  const MAX_PICTURE_BYTES = 300 * 1024

  async function compressImage(file, maxBytes = MAX_PICTURE_BYTES) {
    if (!file || !file.type.startsWith('image/')) return file
    const url = URL.createObjectURL(file)
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = url
      })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const maxDim = 1400
      const { width, height } = img
      let scale = Math.min(1, maxDim / Math.max(width, height))
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const toBlob = (quality) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
      let quality = 0.85
      let blob = await toBlob(quality)
      while (blob && blob.size > maxBytes && quality > 0.4) {
        quality -= 0.1
        blob = await toBlob(quality)
      }
      let step = 0
      while (blob && blob.size > maxBytes && step < 4) {
        // downscale a bit more if still too large
        scale *= 0.85
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        blob = await toBlob(quality)
        step++
      }
      if (!blob) return file
      const out = new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'photo') + '.jpg', { type: 'image/jpeg' })
      return out
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const selectedType = types.find(tt => tt.id === activeType)
  const selectedDefaultValue = Number((selectedType && selectedType.defaultValue != null) ? selectedType.defaultValue : 1)
  const disableWithoutAsking = selectedDefaultValue < 0

  useEffect(() => {
    ;(async () => {
      const [qs, ts] = await Promise.all([listQuests(user?.id), listTaskTypes()])
      if (qs.length) {
        setQuests(qs)
        // pick current quest: start <= now <= end (or no end)
        const now = new Date()
        const current = qs.find(q => {
          const start = q.start ? new Date(q.start) : null
          const end = q.end ? new Date(q.end) : null
          if (!start) return false
          if (start > now) return false
          if (end && end < now) return false
          return true
        })
        setActiveQuest(current ? current.id : '')
      } else {
        setActiveQuest('')
      }
      if (ts.length) {
        setTypes(ts)
        setActiveType(ts[0].id)
      }
    })()
  }, [user?.id])

  useEffect(() => {
    if (activeQuest) api.list({ questId: activeQuest }).then(setTasks)
    else setTasks([])
  }, [api, activeQuest])

  // If selected type indicates a negative value, ensure toggle is off
  useEffect(() => {
    if (disableWithoutAsking && newDoneWA) setNewDoneWA(false)
  }, [disableWithoutAsking])

  const add = async (e) => {
    e.preventDefault()
    if (!activeQuest || !activeType) return
    const typeObj = selectedType
    const description = typeObj?.taskType || ''
    const val = selectedDefaultValue
    const created = await api.create({ description, value: val, questId: activeQuest, taskTypeId: activeType, doneWithoutAsking: newDoneWA, done: true, finalValue: val, comment: commentText, picture: pictureFile })
    setTasks((t) => [created, ...t])
    setNewDoneWA(false)
    setCommentText('')
    setPictureFile(null)
    setLastAddedAt(created?.created ? new Date(created.created) : new Date())
    // Celebrate adding a new task
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 900)
  }

  // Removed toggleDone: tasks are created as done and cannot be toggled

  const toggleBonus = async (id) => {
    const item = tasks.find(t => t.id === id)
    const updated = await api.update(id, { doneWithoutAsking: !item.doneWithoutAsking })
    setTasks(list => list.map(t => t.id === id ? updated : t))
  }

  const remove = async (id) => {
    await api.remove(id)
    setTasks(list => list.filter(t => t.id !== id))
  }

  // const doneCount = tasks.filter(t => t.done).length
  const currentQuest = quests.find(q => q.id === activeQuest)

  return (
    <section className="board">
      <GameHUD tasks={tasks} quest={currentQuest} />
      <ConfettiBurst trigger={celebrate} />
      {/* Removed duplicate Current Quest pane to keep only HUD */}

      {activeQuest && tasks.length === 0 ? (
        <p className="muted">{t('board.noTasksYet')}</p>
      ) : null}

      <form className="board__form" onSubmit={add} aria-label="add-task">
        <TaskTypeSelect types={types} value={activeType} onChange={setActiveType} />
        <label className="form-toggle" title={t('task.bonusTitle')}>
          <input type="checkbox" checked={newDoneWA} onChange={(e) => setNewDoneWA(e.target.checked)} disabled={disableWithoutAsking} />
          <span className="muted" style={{ fontSize: 12 }}>{t('task.withoutAsking')}</span>
        </label>
        <div className="board__comment">
          <input
            className="comment-input"
            placeholder={t('fields.comment')}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const f = e.target.files && e.target.files[0] ? e.target.files[0] : null
              if (!f) { setPictureFile(null); return }
              if (f.size <= MAX_PICTURE_BYTES) { setPictureFile(f); return }
              const compressed = await compressImage(f, MAX_PICTURE_BYTES)
              setPictureFile(compressed)
            }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t('media.takePicture')}
            title={t('media.takePicture')}
          >
            📷
          </button>
        </div>
        <div className="board__actions">
          <button className="btn btn-accent" type="submit" disabled={quests.length > 0 && (!activeQuest || !activeType)}>
            <span className="btn-icon">➕</span> {t('actions.add')}
          </button>
        </div>
      </form>

      {(!activeQuest) ? (
        <p className="muted">{t('board.tipCreate')}</p>
      ) : tasks.length > 0 ? (
        <ul className="board__list">
          {tasks.map((task) => {
            const tt = types.find(tt => tt.id === task.taskType)
            return (
            <li key={task.id} className={task.done ? 'done glow' : ''}>
              <label className="task">
                <div>
                  <div className="task__name" title={tt?.comment || tt?.taskType || ''}>{task.description}</div>
                  <div className="task__date muted">{fmtDateTime(task.created)}</div>
                </div>
                <span className="task__value">
                  {(Number(task.finalValue ?? task.value) || 0) >= 0 ? '+' : '-'}
                  {Math.abs(Number(task.finalValue ?? task.value) || 0)} €
                  {(() => {
                    const val = Number(task.finalValue ?? task.value) || 0
                    const doneWA = isDoneWithoutAsking(task)
                    if (val < 0) {
                      return (
                        <svg className="gain-icon penalty" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" title={t('task.penalty')}>
                          <path fill="currentColor" stroke="rgba(255,255,255,0.9)" strokeWidth="0.5" d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-6h-2v5h2v-5z"/>
                        </svg>
                      )
                    }
                    if (doneWA) {
                      return (
                        <svg className="gain-icon bonus" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false" title={t('task.bonusTitle')}>
                          {/** sparkle icon **/}
                          <path fill="currentColor" d="M12 4l1.5 3.6L17 9l-3.5 1.4L12 14l-1.5-3.6L7 9l3.5-1.4L12 4z"/>
                          <path fill="currentColor" opacity="0.85" d="M12 7l1 2.2L15.2 10 13 10.8 12 13l-1-2.2L8.8 10 11 9.2 12 7z"/>
                        </svg>
                      )
                    }
                    return null
                  })()}
                </span>
              </label>
              <div className="task__actions">
                <button className="link danger" onClick={() => remove(task.id)} aria-label={`${t('task.delete')} ${task.description}`}>
                  {t('task.delete')}
                </button>
              </div>
            </li>
          )})}
        </ul>
      ) : null}
    </section>
  )
}
