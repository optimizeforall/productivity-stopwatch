import { useEffect } from 'react'

type SettingsPanelProps = {
  showIdleTicker: boolean
  onToggleIdleTicker: () => void
  onClose: () => void
}

const IDLE_TICKER_HELP =
  'The red number under the total. It tracks time spent paused or sitting between tasks.'

export function SettingsPanel({
  showIdleTicker,
  onToggleIdleTicker,
  onClose,
}: SettingsPanelProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="confirm-overlay" role="presentation" onClick={onClose}>
      <div
        className="confirm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="settings-title" className="confirm-title">
          Settings
        </h2>
        <div className="settings-list">
          <div className="settings-option">
            <button
              type="button"
              className="settings-row"
              onClick={onToggleIdleTicker}
              role="switch"
              aria-checked={showIdleTicker}
              aria-pressed={showIdleTicker}
              aria-describedby="idle-ticker-help"
            >
              <span className="settings-row-copy">
                <span className="settings-row-label">Wasted time ticker</span>
                <span
                  className={`toggle${showIdleTicker ? ' is-on' : ''}`}
                  aria-hidden="true"
                >
                  <span className="toggle-thumb" />
                </span>
              </span>
            </button>
            <p id="idle-ticker-help" className="settings-tooltip" role="tooltip">
              {IDLE_TICKER_HELP}
            </p>
          </div>
        </div>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
