export async function DelayMs(durationMs:number) {
  if (durationMs === 0) return
  return new Promise(resolve => {
    setTimeout(resolve, durationMs)
  })
}

export async function DelaySecs(durationSecs:number) {
  if (durationSecs < Number.EPSILON) return
  const ms = Math.round(durationSecs * 1000)
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
