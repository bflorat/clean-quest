import React, { useEffect, useRef } from 'react'

export default function ConfettiBurst({ trigger, duration = 1200 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef()
  useEffect(() => {
    if (!trigger) return
    // Respect reduced motion preferences
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frame
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    const colors = ['#7c3aed', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444']
    const count = reduce ? 60 : 150
    const particles = Array.from({ length: count }, () => {
      const angle = (Math.random() * Math.PI) - Math.PI / 2
      const speed = 4 + Math.random() * 6
      return {
        x: width / 2,
        y: height / 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        g: 0.12 + Math.random() * 0.15,
        size: 3 + Math.random() * 5,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[(Math.random() * colors.length) | 0]
      }
    })
    const started = performance.now()
    const draw = (t) => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.vy += p.g
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }
      if (t - started < duration) {
        frame = requestAnimationFrame(draw)
        rafRef.current = frame
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }
    frame = requestAnimationFrame(draw)
    rafRef.current = frame
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [trigger, duration])

  return (
    <canvas
      ref={canvasRef}
      className="confetti"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
        opacity: trigger ? 1 : 0,
        transition: 'opacity 200ms ease-out'
      }}
      aria-hidden
    />
  )
}
