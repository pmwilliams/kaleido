import React, { MouseEvent, TouchEvent } from 'react';

import styles from './MainView.module.css'

type DrawState = {
  isDrawing: boolean
  lastX?: number
  lastY?: number
}

const GLOW_WIDTHS = [30, 15, 10, 5, 2]

const drawGlowLine = (
  ctx: CanvasRenderingContext2D,
  hue: number,
  startX: number,
  startY: number, 
  endX: number, 
  endY: number
) => {
  for (let i = 0; i < GLOW_WIDTHS.length; i++) {
    ctx.beginPath()
    if (i === GLOW_WIDTHS.length - 1) {
      ctx.strokeStyle = 'rgb(255, 255, 255)'
    } else {
      ctx.strokeStyle = `hsla(${hue % 360}, 100%, 50%, 0.2)`
    }
    ctx.lineWidth = GLOW_WIDTHS[i]
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
}

function MainView() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const stateRef = React.useRef<DrawState>({ isDrawing: false })
  const hueRef = React.useRef<number>(0)

  const onClear = () => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const onMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.stopPropagation()
    stateRef.current.isDrawing = true
    stateRef.current.lastX = event.clientX
    stateRef.current.lastY = event.clientY
  }

  const onTouchStart = (event: TouchEvent<HTMLCanvasElement>) => {
    event.stopPropagation()
    stateRef.current.isDrawing = true
    stateRef.current.lastX = event.touches[0].clientX
    stateRef.current.lastY = event.touches[0].clientY
  }

  const onMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    draw(event.clientX, event.clientY)
  }

  const onTouchMove = (event: TouchEvent<HTMLCanvasElement>) => {
    draw(event.touches[0].clientX, event.touches[0].clientY)
  }

  const draw = (x: number, y: number) => {
    const state = stateRef.current
    if (!canvasRef.current || !state.isDrawing || !state.lastX || !state.lastY) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')

    if (!ctx) {
      console.log('no context')
      return
    }

    console.log(canvasRef.current.width, canvasRef.current.width / window.devicePixelRatio)

    const width = canvasRef.current.width / window.devicePixelRatio
    const height = canvasRef.current.height / window.devicePixelRatio
  
    const lastXAdj = state.lastX - width / 2
    const lastYAdj = state.lastY - height / 2
    const newXAdj = x - width / 2
    const newYAdj = y - height / 2

    ctx.save()
    ctx.translate(width / 2, height / 2)
    
    ctx.beginPath()
    ctx.strokeStyle = 'rgb(255, 255, 255)'
    ctx.lineWidth = 2
    ctx.moveTo(0, 0)
    ctx.lineTo(1, 1)
    ctx.stroke()

    drawGlowLine(ctx, hueRef.current, lastXAdj, lastYAdj, newXAdj, newYAdj)

    for (let i = 1; i < 6; i++)
    {
      ctx.save()
      ctx.rotate(((2 * Math.PI) / 6) * i)
      
      drawGlowLine(ctx, hueRef.current, lastXAdj, lastYAdj, newXAdj, newYAdj)

      ctx.restore()
    }
    
      ctx.restore()

    state.lastX = x
    state.lastY = y
  }

  const onMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    stateRef.current.isDrawing = false
    stateRef.current.lastX = undefined
    stateRef.current.lastY = undefined
  }

  const onTouchEnd = (event: TouchEvent<HTMLCanvasElement>) => {
    stateRef.current.isDrawing = false
    stateRef.current.lastX = undefined
    stateRef.current.lastY = undefined
  }

  const tick = React.useCallback(() => {
    hueRef.current = (hueRef.current + 0.3) % 360
    requestAnimationFrame(tick)
  }, [])

  React.useEffect(() => {
    requestAnimationFrame(tick)
  }, [tick])

  React.useEffect(() => {
    if (!canvasRef.current) {
      console.log('no canvas')
      return
    }

    const ctx = canvasRef.current.getContext('2d')

    if (!ctx) {
      console.log('no context')
      return
    }

    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'round'
  }, [])

  return (
    <div 
      className="App">
        <canvas
          ref={canvasRef}
          className={styles.Canvas}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        <div 
          className={styles.Toolbar}>
          <button 
            className={styles.button}
            onClick={onClear}>
            <div 
              className={styles.EraserSvg}>
            </div>
          </button>
        </div>
    </div>
  )
}

export default MainView
