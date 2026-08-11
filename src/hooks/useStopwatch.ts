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
  idleAccumulatedMs: number
  idleStartedAt: number | null
  status: Status
  theme: Theme
  showIdleTicker: boolean
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
    idleAccumulatedMs: 0,
    idleStartedAt: Date.now(),
    status: 'naming',
    theme: 'dark',
    showIdleTicker: true,
  }
}

function isIdle(status: Status): boolean {
  return status === 'paused' || status === 'naming'
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
    const resolvedStatus =
      status === 'running' && startedAt == null ? 'paused' : status
    const idleAccumulatedMs =
      typeof parsed.idleAccumulatedMs === 'number' ? parsed.idleAccumulatedMs : 0
    const storedIdleStartedAt =
      typeof parsed.idleStartedAt === 'number' ? parsed.idleStartedAt : null

    return {
      tasks,
      accumulatedMs:
        typeof parsed.accumulatedMs === 'number' ? parsed.accumulatedMs : 0,
      startedAt: resolvedStatus === 'running' ? startedAt : null,
      idleAccumulatedMs,
      idleStartedAt: isIdle(resolvedStatus)
        ? (storedIdleStartedAt ?? Date.now())
        : null,
      status: resolvedStatus,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      showIdleTicker: parsed.showIdleTicker !== false,
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
  const total = tasks.slice(1).reduce((sum, task) => sum + task.durationMs, 0)
  // Whole seconds only, so the total ticks over in phase with the current task.
  return Math.floor(total / 1000) * 1000
}

function idleElapsed(state: PersistedState, now: number): number {
  if (isIdle(state.status) && state.idleStartedAt != null) {
    return state.idleAccumulatedMs + Math.max(0, now - state.idleStartedAt)
  }
  return state.idleAccumulatedMs
}

function startIdle(
  prev: PersistedState,
  now: number,
): Pick<PersistedState, 'idleAccumulatedMs' | 'idleStartedAt'> {
  if (isIdle(prev.status) && prev.idleStartedAt != null) {
    return {
      idleAccumulatedMs: prev.idleAccumulatedMs,
      idleStartedAt: prev.idleStartedAt,
    }
  }
  return {
    idleAccumulatedMs: prev.idleAccumulatedMs,
    idleStartedAt: now,
  }
}

function stopIdle(
  prev: PersistedState,
  now: number,
): Pick<PersistedState, 'idleAccumulatedMs' | 'idleStartedAt'> {
  return {
    idleAccumulatedMs: idleElapsed(prev, now),
    idleStartedAt: null,
  }
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
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

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
  const idleMs = idleElapsed(state, now)
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
      const now = Date.now()
      const frozen = currentElapsed(prev, now)
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
        ...startIdle(prev, now),
      }
    })
  }, [])

  const begin = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'naming') return prev
      const name = prev.tasks[0]?.name.trim()
      if (!name) return prev
      const now = Date.now()
      return {
        ...prev,
        tasks: [{ ...prev.tasks[0], name, durationMs: 0 }, ...prev.tasks.slice(1)],
        accumulatedMs: 0,
        startedAt: now,
        status: 'running',
        ...stopIdle(prev, now),
      }
    })
  }, [])

  const undo = useCallback(() => {
    setState((prev) => {
      const now = Date.now()

      if (prev.status === 'naming') {
        const [, previous, ...older] = prev.tasks
        if (previous == null) return prev
        return {
          ...prev,
          tasks: [previous, ...older],
          accumulatedMs: previous.durationMs,
          startedAt: now,
          status: 'running',
          ...stopIdle(prev, now),
        }
      }

      const discarded = currentElapsed(prev, now)
      return {
        ...prev,
        tasks: [{ ...prev.tasks[0], durationMs: 0 }, ...prev.tasks.slice(1)],
        accumulatedMs: 0,
        startedAt: null,
        status: 'naming',
        idleAccumulatedMs: idleElapsed(prev, now) + discarded,
        idleStartedAt: now,
      }
    })
  }, [])

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running') return prev
      const now = Date.now()
      const frozen = currentElapsed(prev, now)
      return {
        ...prev,
        accumulatedMs: frozen,
        startedAt: null,
        status: 'paused',
        tasks: [
          { ...prev.tasks[0], durationMs: frozen },
          ...prev.tasks.slice(1),
        ],
        ...startIdle(prev, now),
      }
    })
  }, [])

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'paused') return prev
      const now = Date.now()
      return {
        ...prev,
        startedAt: now,
        status: 'running',
        ...stopIdle(prev, now),
      }
    })
  }, [])

  const reset = useCallback(() => {
    setState((prev) => ({
      ...createInitialState(),
      theme: prev.theme,
      showIdleTicker: prev.showIdleTicker,
    }))
  }, [])

  const toggleTheme = useCallback(() => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }, [])

  const toggleIdleTicker = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showIdleTicker: !prev.showIdleTicker,
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
    idleMs,
    showIdleTicker: state.showIdleTicker,
    canBegin: (state.tasks[0]?.name.trim().length ?? 0) > 0,
    canUndo: state.status === 'naming' ? state.tasks.length > 1 : true,
    ship,
    undo,
    begin,
    pause,
    resume,
    reset,
    toggleTheme,
    toggleIdleTicker,
    renameCurrent,
  }
}
