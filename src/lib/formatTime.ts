function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function parts(ms: number): { hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { hours, minutes, seconds }
}

export function formatCurrent(ms: number): string {
  const { hours, minutes, seconds } = parts(ms)
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${minutes}:${pad(seconds)}`
}

export function formatTotal(ms: number): string {
  const { hours, minutes, seconds } = parts(ms)
  return `${hours}:${pad(minutes)}:${pad(seconds)}`
}

export function formatMinutes(ms: number): string {
  return `${Math.round(ms / 60_000)}m`
}
