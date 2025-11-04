import React, { useEffect, useMemo, useState } from 'react'
import { tasksApi } from '../services/tasks.js'
import { listQuests, listTaskTypes } from '../services/pbData.js'
import ConfettiBurst from './ConfettiBurst.jsx'
import { useSound } from '../hooks/useSound.js'
import GameHUD from './GameHUD.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useI18n } from '../i18n/I18nProvider.jsx'
import { isDoneWithoutAsking } from '../lib/taskFlags.js'
import { taskValue, taskValueWithSource, toNumber } from '../lib/taskValue.js'
import { canDeleteTask } from '../lib/taskPolicy.js'
import TaskTypeSelect from './TaskTypeSelect.jsx'
import { fileUrl } from '../services/pb.js'

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
  const [previewSrc, setPreviewSrc] = useState('')
  const [tasksLoading, setTasksLoading] = useState(false)

  const MAX_PICTURE_BYTES = 200 * 1024

  async function compressImage(file, maxBytes = MAX_PICTURE_BYTES) {
    if (!file || !file.type?.startsWith('image/')) return file
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

      async function toJpeg(q) {
        return new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', q))
      }
      async function toPng() {
        return new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'))
      }

      let quality = 0.85
      let blob = await toJpeg(quality)
      if (!blob) blob = await toPng()

      while (blob && blob.size > maxBytes && quality > 0.4) {
        quality -= 0.1
        blob = await toJpeg(quality)
        if (!blob) blob = await toPng()
      }
      let step = 0
      while (blob && blob.size > maxBytes && step < 8) {
        scale *= 0.85
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        if (quality > 0.5) quality -= 0.05
        blob = await toJpeg(quality)
        if (!blob) blob = await toPng()
        step++
      }
      if (!blob) return file
      const mime = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg'
      const ext = mime === 'image/png' ? '.png' : '.jpg'
      const base = (file.name && file.name.replace(/\.[^.]+$/, '')) || 'photo'
      return new File([blob], base + ext, { type: mime })
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
        // Do not preselect a task type; user must choose one
        setActiveType('')
      }
    })()
  }, [user?.id])

  useEffect(() => {
    if (activeQuest) {
      setTasksLoading(true)
      api.list({ questId: activeQuest }).then((ts) => {
        try { if (import.meta?.env?.DEV) console.debug('[TaskBoard] fetched tasks sample:', ts.slice(0, 3)) } catch {}
        setTasks(ts)
      }).finally(() => setTasksLoading(false))
    } else {
      setTasks([])
      setTasksLoading(false)
    }
  }, [api, activeQuest])

  // If selected type indicates a negative value, ensure toggle is off
  useEffect(() => {
    if (disableWithoutAsking && newDoneWA) setNewDoneWA(false)
  }, [disableWithoutAsking])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setPreviewSrc('') }
    if (previewSrc) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [previewSrc])

  const add = async (e) => {
    e.preventDefault()
    if (!activeQuest || !activeType) return
    const val = selectedDefaultValue
    const created = await api.create({ value: val, questId: activeQuest, taskTypeId: activeType, doneWithoutAsking: newDoneWA, done: true, finalValue: val, comment: commentText, picture: pictureFile })
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
      <GameHUD tasks={tasks} quest={currentQuest} types={types} quests={quests} />
      <ConfettiBurst trigger={celebrate} />
      {/* Removed duplicate Current Quest pane to keep only HUD */}

      {activeQuest && tasks.length === 0 ? (
        <p className="muted">{t('board.noTasksYet')}</p>
      ) : null}

      <form className="board__form" onSubmit={add} aria-label="add-task">
        <div className="board__formTitle">{t('board.addNewTask')}</div>
        <TaskTypeSelect types={types} value={activeType} onChange={setActiveType} disabled={!activeQuest} />
        <label className="form-toggle" title={t('task.bonusTitle')}>
          <input type="checkbox" checked={newDoneWA} onChange={(e) => setNewDoneWA(e.target.checked)} disabled={disableWithoutAsking || !activeQuest || !activeType} />
          <span className="muted" style={{ fontSize: 12 }}>{t('task.withoutAsking')}</span>
        </label>
        <div className="board__comment">
          <input
            className="comment-input"
            placeholder={t('fields.comment')}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!activeQuest}
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
              const processed = await compressImage(f, MAX_PICTURE_BYTES)
              setPictureFile(processed)
            }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t('media.takePicture')}
            title={t('media.takePicture')}
            disabled={!activeQuest}
          >
            <span className="cam-emoji" aria-hidden="true">📷</span>
          </button>
        </div>
        <div className="board__actions">
          <button className="btn btn-accent" type="submit" disabled={!activeQuest || !activeType}>
            <span className="btn-icon">➕</span> {t('actions.add')}
          </button>
        </div>
      </form>

      {(!activeQuest) ? (
        <p className="muted">{t('board.tipCreate')}</p>
      ) : tasksLoading ? (
        <ul className="board__list" aria-busy="true" aria-live="polite">
          <li className="done">
            <label className="task">
              <div>
                <div className="task__name muted">{t('loading.loading') || 'Loading…'}</div>
                <div className="task__date muted">&nbsp;</div>
              </div>
              <span className="task__value" aria-hidden="true">
                <span className="spinner" />
              </span>
            </label>
          </li>
        </ul>
      ) : tasks.length > 0 ? (
        <ul className="board__list">
          {tasks.map((task) => {
            const tt = types.find(tt => tt.id === task.taskType)
            const displayName = tt?.taskType || task.description || ''
            const tvForDelete = taskValue(task)
            const deletable = canDeleteTask(task, { isAdmin: false })
            return (
            <li key={task.id} className={task.done ? 'done glow' : ''}>
              <label className="task">
                <div>
                  <div className="task__name" title={(task.done && task.comment) ? task.comment : (tt?.comment || tt?.taskType || '')}>{displayName}</div>
                  <div className="task__date muted">{fmtDateTime(task.created)}</div>
                </div>
                {(() => {
                  const { value: baseVal, source } = taskValueWithSource(task)
                  const tt = types.find(tt => tt.id === task.taskType)
                  const effective = (source !== 'none' && baseVal !== 0) ? baseVal : toNumber(tt?.defaultValue ?? 0)
                  const tv = Number.isFinite(effective) ? effective : 0
                  const unit = (currentQuest?.unit || 'XP').trim()
                  const abs = Math.abs(tv)
                  const sign = tv >= 0 ? '+' : '-'
                  const rendered = (unit === '€' || unit === '$')
                    ? `${sign}${unit} ${abs}`
                    : `${sign}${abs} ${unit}`
                  return (
                <span className="task__value" title={`value: ${tv} (source: ${source !== 'none' ? source : 'taskType.defaultValue'})`}>
                  {rendered}
                  {(() => {
                  const val = tv
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
                  {task.picture ? (
                    <button
                      type="button"
                      onClick={() => setPreviewSrc(fileUrl('tasks', task.id, task.picture))}
                      aria-label={t('media.viewPicture')}
                      title={t('media.viewPicture')}
                      style={{ marginLeft: 6, background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}
                    >
                      🖼️
                    </button>
                  ) : null}
                </span>
                )})()}
              </label>
              <div className="task__actions">
                <button className="link danger" onClick={() => remove(task.id)} aria-label={`${t('task.delete')} ${displayName}`} disabled={!deletable} title={!deletable ? t('task.cannotDeletePenalty') : t('task.delete')}>
                  {t('task.delete')}
                </button>
              </div>
            </li>
          )})}
        </ul>
      ) : null}
      {previewSrc ? (
        <div className="lightboxBackdrop" onClick={() => setPreviewSrc('')}>
          <div className="lightbox" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="lightboxClose" onClick={() => setPreviewSrc('')} aria-label={t('actions.close')} title={t('actions.close')}>×</button>
            <img src={previewSrc} alt={t('media.pictureAlt')} className="lightboxImg" />
          </div>
        </div>
      ) : null}
    </section>
  )
}
