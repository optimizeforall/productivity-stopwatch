import { formatCurrent, formatTotal } from '../lib/formatTime.ts'
import type { Status } from '../hooks/useStopwatch.ts'

type TimerDisplayProps = {
  currentMs: number
  totalMs: number
  idleMs: number
  showIdleTicker: boolean
  status: Status
}

export function TimerDisplay({
  currentMs,
  totalMs,
  idleMs,
  showIdleTicker,
  status,
}: TimerDisplayProps) {
  return (
    <section className="timers" aria-live="polite">
      <p className={`timer-current${status === 'paused' ? ' is-paused' : ''}`}>
        {formatCurrent(currentMs)}
      </p>
      <p className="timer-total">{formatTotal(totalMs)}</p>
      {showIdleTicker && status !== 'running' ? (
        <p className="timer-idle">{formatTotal(idleMs)}</p>
      ) : null}
    </section>
  )
}
