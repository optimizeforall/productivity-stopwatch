import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { formatMinutes } from '../lib/formatTime.ts'
import type { Status, Task } from '../hooks/useStopwatch.ts'

export type TaskListHandle = {
  focusName: () => void
}

type TaskListProps = {
  tasks: Task[]
  status: Status
  onRename: (name: string) => void
  onBegin: () => void
  ref?: Ref<TaskListHandle>
}

export function TaskList({
  tasks,
  status,
  onRename,
  onBegin,
  ref,
}: TaskListProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const naming = status === 'naming'

  useImperativeHandle(ref, () => ({
    focusName() {
      const input = inputRef.current
      if (!input) return
      input.focus()
      input.select()
    },
  }))

  useEffect(() => {
    if (!naming) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [naming, tasks[0]?.id])

  const [current, ...rest] = tasks

  return (
    <ul className="task-list">
      {current ? (
        <li className="task-row is-active">
          <label className="task-name-label">
            <span className="task-number">{tasks.length}.</span>
            <input
              ref={inputRef}
              className="task-input"
              value={current.name}
              readOnly={!naming}
              onChange={(event) => onRename(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && naming) onBegin()
              }}
              aria-label="Current task name"
              autoCapitalize="sentences"
              autoComplete="off"
              enterKeyHint="done"
            />
          </label>
          <span className="task-duration">{formatMinutes(current.durationMs)}</span>
        </li>
      ) : null}
      {rest.map((task, index) => {
        const number = rest.length - index
        return (
          <li key={task.id} className="task-row">
            <p className="task-name">
              <span className="task-number">{number}.</span>
              {task.name}
            </p>
            <span className="task-duration">{formatMinutes(task.durationMs)}</span>
          </li>
        )
      })}
    </ul>
  )
}
