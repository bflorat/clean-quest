const baseUrl = (import.meta?.env?.VITE_POCKETDB_URL || '').trim()
const envToken = import.meta?.env?.VITE_PB_TOKEN
const TOKEN_KEY = 'pb:token'
const USER_KEY = 'pb:user'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || envToken || ''
  } catch {
    return envToken || ''
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setAuth(token, userRecord) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    if (userRecord) localStorage.setItem(USER_KEY, JSON.stringify(userRecord))
  } catch {}
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {}
}

async function request(path, { method = 'GET', body, query } = {}) {
  const qs = query ? '?' + new URLSearchParams(query).toString() : ''
  const origin = baseUrl ? baseUrl.replace(/\/$/, '') : ''
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const res = await fetch(origin + path + qs, {
    method,
    headers: {
      ...(!isForm && body ? { 'Content-Type': 'application/json' } : {}),
      ...((getToken()) ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`PB ${method} ${path} ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const pb = {
  async list(collection, { page = 1, perPage = 50, sort, filter } = {}) {
    const data = await request(`/api/collections/${collection}/records`, {
      query: {
        page, perPage,
        ...(sort ? { sort } : {}),
        ...(filter ? { filter } : {}),
      },
    })
    // PocketBase returns { page, perPage, totalItems, items }
    return Array.isArray(data?.items) ? data.items : []
  },
  async create(collection, data) {
    return request(`/api/collections/${collection}/records`, { method: 'POST', body: data })
  },
  async update(collection, id, data) {
    return request(`/api/collections/${collection}/records/${id}`, { method: 'PATCH', body: data })
  },
  async remove(collection, id) {
    await request(`/api/collections/${collection}/records/${id}`, { method: 'DELETE' })
  },
}

export async function login(identity, password) {
  const data = await request('/api/collections/users/auth-with-password', {
    method: 'POST',
    body: { identity, password },
  })
  if (data?.token && data?.record) setAuth(data.token, data.record)
  return data
}

export async function refreshAuth() {
  const data = await request('/api/collections/users/auth-refresh', { method: 'POST' })
  if (data?.token && data?.record) setAuth(data.token, data.record)
  return data
}

export function fileUrl(collectionIdOrName, recordId, fileName, query) {
  if (!fileName) return ''
  const origin = (baseUrl || '').replace(/\/$/, '')
  const qs = query ? '?' + new URLSearchParams(query).toString() : ''
  return `${origin}/api/files/${collectionIdOrName}/${recordId}/${fileName}${qs}`
}

export function userAvatarUrl(user, { thumb = '64x64' } = {}) {
  if (!user?.avatar) return ''
  const col = user.collectionId || '_pb_users_auth_'
  return fileUrl(col, user.id, user.avatar, thumb ? { thumb } : undefined)
}

// Admin auth helpers removed as the app uses PocketBase GUI for admin tasks.
