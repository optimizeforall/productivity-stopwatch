import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
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
  const previousNameRef = useRef('')
  const cancelingRef = useRef(false)
  const naming = status === 'naming'
  const [editing, setEditing] = useState(naming)
  const canEdit = naming || editing

  useImperativeHandle(ref, () => ({
    focusName() {
      const input = inputRef.current
      if (!input) return
      input.focus()
      input.select()
    },
  }))

  useEffect(() => {
    setEditing(naming)
  }, [naming])

  useEffect(() => {
    if (!canEdit) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [canEdit, tasks[0]?.id])

  const [current, ...rest] = tasks

  function startEdit() {
    if (naming || !current) return
    previousNameRef.current = current.name
    cancelingRef.current = false
    setEditing(true)
  }

  function commitEdit(value: string) {
    const trimmed = value.trim()
    onRename(trimmed || previousNameRef.current || current?.name || '')
    setEditing(false)
  }

  return (
    <ul className="task-list">
      {current ? (
        <li className="task-row is-active">
          <label
            className="task-name-label"
            onDoubleClick={(event) => {
              event.preventDefault()
              startEdit()
            }}
          >
            <span className="task-number">{tasks.length}.</span>
            <input
              ref={inputRef}
              className="task-input"
              value={current.name}
              readOnly={!canEdit}
              onChange={(event) => onRename(event.target.value)}
              onBlur={(event) => {
                if (naming) return
                if (cancelingRef.current) {
                  cancelingRef.current = false
                  setEditing(false)
                  return
                }
                if (editing) commitEdit(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  if (naming) onBegin()
                  else event.currentTarget.blur()
                }
                if (event.key === 'Escape' && !naming) {
                  cancelingRef.current = true
                  onRename(previousNameRef.current)
                  setEditing(false)
                  event.currentTarget.blur()
                }
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
