import React, { MouseEvent } from 'react';

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
    ctx.lineTo(endX,endY)
    ctx.stroke()
  }
}

function MainView() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const stateRef = React.useRef<DrawState>({ isDrawing: false })
  const hueRef = React.useRef<number>(0)

  const onMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    event.stopPropagation()
    stateRef.current.isDrawing = true
    stateRef.current.lastX = event.clientX
    stateRef.current.lastY = event.clientY
  }

  const onMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
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
    const newXAdj = event.clientX - width / 2
    const newYAdj = event.clientY - height / 2

    ctx.save()
    ctx.translate(width / 2, height / 2)
    
    ctx.beginPath()
    ctx.strokeStyle = 'rgb(255, 255, 255)'
    ctx.lineWidth = 2
    ctx.moveTo(0, 0)
    ctx.lineTo(1, 1)
    ctx.stroke()

    drawGlowLine(ctx, hueRef.current, lastXAdj, lastYAdj, newXAdj, newYAdj)

    for (let i = 1; i < 2; i++)
    {
      ctx.save()
      ctx.rotate(((2 * Math.PI) / 2) * i)
      
      drawGlowLine(ctx, hueRef.current, lastXAdj, lastYAdj, newXAdj, newYAdj)

      ctx.restore()
    }
    
      ctx.restore()

    state.lastX = event.clientX
    state.lastY = event.clientY
  }

  const onMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    stateRef.current.isDrawing = false
    stateRef.current.lastX = undefined
    stateRef.current.lastY = undefined
  }

  const tick = React.useCallback(() => {
    hueRef.current = (hueRef.current + 0.1) % 360
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
        />
    </div>
  )
}

export default MainView
