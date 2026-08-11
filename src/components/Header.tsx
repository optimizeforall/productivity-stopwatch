type HeaderProps = {
  theme: 'light' | 'dark'
  onReset: () => void
  onToggleTheme: () => void
}

export function Header({ theme, onReset, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header-title">Stopwatch</h1>
      <div className="header-actions">
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          Reset
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3.2v1.8M12 19v1.8M3.2 12h1.8M19 12h1.8M5.64 5.64l1.27 1.27M17.09 17.09l1.27 1.27M5.64 18.36l1.27-1.27M17.09 6.91l1.27-1.27"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M16.6 13.4A7 7 0 0 1 10.2 4.2 7.2 7.2 0 1 0 19.8 13.8a7 7 0 0 1-3.2-.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}
