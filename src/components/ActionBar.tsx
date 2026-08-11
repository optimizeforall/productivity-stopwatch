import type { Status } from '../hooks/useStopwatch.ts'

type ActionBarProps = {
  status: Status
  canBegin: boolean
  onShip: () => void
  onBegin: () => void
  onPause: () => void
  onResume: () => void
}

export function ActionBar({
  status,
  canBegin,
  onShip,
  onBegin,
  onPause,
  onResume,
}: ActionBarProps) {
  if (status === 'naming') {
    return (
      <div className="action-bar">
        <button
          type="button"
          className="btn btn-begin"
          onClick={onBegin}
          disabled={!canBegin}
        >
          Begin
        </button>
      </div>
    )
  }

  return (
    <div className="action-bar">
      <button type="button" className="btn btn-ship" onClick={onShip}>
        Ship
      </button>
      {status === 'paused' ? (
        <button type="button" className="btn btn-ghost btn-secondary" onClick={onResume}>
          Resume
        </button>
      ) : (
        <button type="button" className="btn btn-ghost btn-secondary" onClick={onPause}>
          Pause
        </button>
      )}
    </div>
  )
}
