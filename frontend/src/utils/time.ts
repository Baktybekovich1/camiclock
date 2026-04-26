export const formatSeconds = (seconds: number) => {
  const abs = Math.max(0, seconds)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)

  return `${h}ч ${m.toString().padStart(2, '0')}м`
}

export const elapsedFrom = (startedAt: string) => {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  return formatSeconds(diff)
}
