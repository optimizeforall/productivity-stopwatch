import { useCallback, useEffect, useState } from 'react'

export type Task = {
  id: string
  name: string
  durationMs: number
}

export type Status = 'running' | 'paused' | 'naming'
export type Theme = 'light' | 'dark'

type PersistedState = {
  tasks: Task[]
  accumulatedMs: number
  startedAt: number | null
  status: Status
  theme: Theme
}

const STORAGE_KEY = 'productivity-stopwatch-v1'
const NEW_TASK_NAME = 'New Task'

function createId(): string {
  return crypto.randomUUID()
}

function createBlankTask(): Task {
  return { id: createId(), name: NEW_TASK_NAME, durationMs: 0 }
}

function createInitialState(): PersistedState {
  return {
    tasks: [createBlankTask()],
    accumulatedMs: 0,
    startedAt: null,
    status: 'naming',
    theme: 'dark',
  }
}

function isStatus(value: unknown): value is Status {
  return value === 'running' || value === 'paused' || value === 'naming'
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()

    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return createInitialState()
    }

    const tasks = parsed.tasks.filter(
      (task): task is Task =>
        typeof task?.id === 'string' &&
        typeof task?.name === 'string' &&
        typeof task?.durationMs === 'number',
    )
    if (tasks.length === 0) return createInitialState()

    const status = isStatus(parsed.status) ? parsed.status : 'naming'
    const startedAt =
      typeof parsed.startedAt === 'number' ? parsed.startedAt : null

    return {
      tasks,
      accumulatedMs:
        typeof parsed.accumulatedMs === 'number' ? parsed.accumulatedMs : 0,
      startedAt: status === 'running' ? startedAt : null,
      status: status === 'running' && startedAt == null ? 'paused' : status,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    }
  } catch {
    return createInitialState()
  }
}

function currentElapsed(state: PersistedState, now: number): number {
  if (state.status === 'naming') return 0
  if (state.status === 'running' && state.startedAt != null) {
    return state.accumulatedMs + Math.max(0, now - state.startedAt)
  }
  return state.accumulatedMs
}

function completedDuration(tasks: Task[]): number {
  return tasks.slice(1).reduce((sum, task) => sum + task.durationMs, 0)
}

export function useStopwatch() {
  const [state, setState] = useState<PersistedState>(loadState)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
    const themeColor = state.theme === 'light' ? '#f3f0ea' : '#0e0f12'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor)
  }, [state.theme])

  useEffect(() => {
    if (state.status !== 'running') return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [state.status])

  useEffect(() => {
    const sync = () => setNow(Date.now())
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const elapsed = currentElapsed(state, now)
  const totalMs =
    completedDuration(state.tasks) +
    (state.status === 'naming' ? 0 : elapsed)

  const tasks: Task[] = state.tasks.map((task, index) =>
    index === 0 && state.status !== 'naming'
      ? { ...task, durationMs: elapsed }
      : task,
  )

  const ship = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'naming' || prev.tasks.length === 0) return prev
      const frozen = currentElapsed(prev, Date.now())
      const [current, ...rest] = prev.tasks
      return {
        ...prev,
        tasks: [
          createBlankTask(),
          { ...current, durationMs: frozen },
          ...rest,
        ],
        accumulatedMs: 0,
        startedAt: null,
        status: 'naming',
      }
    })
  }, [])

  const begin = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'naming') return prev
      const name = prev.tasks[0]?.name.trim()
      if (!name) return prev
      return {
        ...prev,
        tasks: [{ ...prev.tasks[0], name, durationMs: 0 }, ...prev.tasks.slice(1)],
        accumulatedMs: 0,
        startedAt: Date.now(),
        status: 'running',
      }
    })
  }, [])

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev
      const frozen = currentElapsed(prev, Date.now())
      return {
        ...prev,
        accumulatedMs: frozen,
        startedAt: null,
        status: 'paused',
        tasks: [
          { ...prev.tasks[0], durationMs: frozen },
          ...prev.tasks.slice(1),
        ],
      }
    })
  }, [])

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'paused') return prev
      return {
        ...prev,
        startedAt: Date.now(),
        status: 'running',
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState((prev) => ({
      ...createInitialState(),
      theme: prev.theme,
    }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }, [])

  const renameCurrent = useCallback((name: string) => {
    setState((prev) => {
      if (prev.tasks.length === 0) return prev
      return {
        ...prev,
        tasks: [{ ...prev.tasks[0], name }, ...prev.tasks.slice(1)],
      }
    })
  }, [])

  return {
    tasks,
    status: state.status,
    theme: state.theme,
    currentMs: elapsed,
    totalMs,
    canBegin: (state.tasks[0]?.name.trim().length ?? 0) > 0,
    ship,
    begin,
    pause,
    resume,
    reset,
    toggleTheme,
    renameCurrent,
  }
}
