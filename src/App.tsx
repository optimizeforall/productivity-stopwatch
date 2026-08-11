import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { ActionBar } from './components/ActionBar.tsx'
import { Header } from './components/Header.tsx'
import { TaskList, type TaskListHandle } from './components/TaskList.tsx'
import { TimerDisplay } from './components/TimerDisplay.tsx'
import { useStopwatch } from './hooks/useStopwatch.ts'

export default function App() {
  const listRef = useRef<TaskListHandle>(null)
  const {
    tasks,
    status,
    theme,
    currentMs,
    totalMs,
    idleMs,
    canBegin,
    ship,
    begin,
    pause,
    resume,
    reset,
    toggleTheme,
    renameCurrent,
  } = useStopwatch()

  function shipAndFocus() {
    flushSync(() => {
      ship()
    })
    listRef.current?.focusName()
  }

  function resetAndFocus() {
    flushSync(() => {
      reset()
    })
    listRef.current?.focusName()
  }

  return (
    <div className="app">
      <Header theme={theme} onReset={resetAndFocus} onToggleTheme={toggleTheme} />
      <TimerDisplay
        currentMs={currentMs}
        totalMs={totalMs}
        idleMs={idleMs}
        status={status}
      />
      <TaskList
        ref={listRef}
        tasks={tasks}
        status={status}
        onRename={renameCurrent}
        onBegin={begin}
      />
      <ActionBar
        status={status}
        canBegin={canBegin}
        onShip={shipAndFocus}
        onBegin={begin}
        onPause={pause}
        onResume={resume}
      />
    </div>
  )
}
