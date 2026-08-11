import '@testing-library/jest-dom/vitest'

const storage = new Map()
const localStorageMock = {
  clear: () => storage.clear(),
  getItem: (key) => storage.get(key) ?? null,
  key: (index) => [...storage.keys()][index] ?? null,
  removeItem: (key) => storage.delete(key),
  setItem: (key, value) => storage.set(String(key), String(value)),
  get length() { return storage.size }
}

// Node's experimental Storage global is unavailable in the test workers.
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: localStorageMock })
Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageMock })

// Make sure tests start from a clean storage state
beforeEach(() => {
  localStorageMock.clear()
})
