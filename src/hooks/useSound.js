export function useSound() {
  let ctx
  const ensureCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    return ctx
  }
  const playBeep = ({ freq = 880, duration = 0.12, type = 'triangle', volume = 0.05 } = {}) => {
    try {
      const audio = ensureCtx()
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, audio.currentTime)
      gain.gain.value = volume
      osc.connect(gain)
      gain.connect(audio.destination)
      osc.start()
      osc.stop(audio.currentTime + duration)
    } catch {}
  }
  const success = () => {
    playBeep({ freq: 1046 })
    setTimeout(() => playBeep({ freq: 1318 }), 80)
  }
  return { success, beep: playBeep }
}

