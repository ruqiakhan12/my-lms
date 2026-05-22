'use client'
import { useEffect, useRef, useState } from 'react'

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [screenSharing, setScreenSharing] = useState(false)
  const [screenError, setScreenError] = useState('')

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const getPos = (e: any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top
    }
  }

  const startDraw = (e: any) => {
    e.preventDefault()
    setIsDrawing(true)
    lastPos.current = getPos(e)
  }

  const draw = (e: any) => {
    e.preventDefault()
    if (!isDrawing || !lastPos.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 6 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const stopDraw = () => {
    setIsDrawing(false)
    lastPos.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveImage = () => {
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvasRef.current!.toDataURL()
    link.click()
  }

  // CAMERA START
  const startCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied! Browser settings mein allow karo.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('Koi camera nahi mila device pe!')
      } else {
        setCameraError('Camera error: ' + err.message)
      }
    }
  }

  // CAMERA STOP
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
    setCameraError('')
  }

  // SCREEN SHARE START
  const startScreenShare = async () => {
    setScreenError('')
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: false
      })
      screenStreamRef.current = stream

      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!

      const drawFrame = () => {
        if (!screenStreamRef.current) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        requestAnimationFrame(drawFrame)
      }
      drawFrame()
      setScreenSharing(true)

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setScreenError('Screen share cancel ho gaya!')
      } else {
        setScreenError('Screen share error: ' + err.message)
      }
    }
  }

  // SCREEN SHARE STOP
  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    screenStreamRef.current = null
    setScreenSharing(false)
    setScreenError('')
  }

  const colors = [
    '#000000', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#3b82f6',
    '#8b5cf6', '#ec4899', '#ffffff'
  ]

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      fontFamily: 'sans-serif'
    }}>

      {/* TOOLBAR */}
      <div style={{
        background: '#1e293b',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>

        {/* Logo */}
        <span style={{
          color: 'white',
          fontWeight: 800,
          fontSize: 16,
          marginRight: 8
        }}>🎓 Whiteboard</span>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

        {/* Pen */}
        <button onClick={() => setTool('pen')} style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: 'none',
          background: tool === 'pen' ? '#6366f1' : 'rgba(255,255,255,0.08)',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 13
        }}>✏️ Pen</button>

        {/* Eraser */}
        <button onClick={() => setTool('eraser')} style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: 'none',
          background: tool === 'eraser' ? '#6366f1' : 'rgba(255,255,255,0.08)',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 13
        }}>🧹 Eraser</button>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

        {/* Colors */}
        {colors.map(c => (
          <div
            key={c}
            onClick={() => { setColor(c); setTool('pen') }}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: c,
              cursor: 'pointer',
              border: color === c
                ? '3px solid white'
                : c === '#ffffff'
                  ? '2px solid rgba(255,255,255,0.3)'
                  : '2px solid transparent',
              transform: color === c ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.15s'
            }}
          />
        ))}

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

        {/* Size */}
        <input
          type="range"
          min={1}
          max={12}
          value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))}
          style={{ width: 80, accentColor: '#6366f1' }}
        />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          {lineWidth}px
        </span>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

        {/* Clear */}
        <button onClick={clearCanvas} style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: 'none',
          background: 'rgba(239,68,68,0.15)',
          color: '#f87171',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 13
        }}>🗑️ Clear</button>

        {/* Save */}
        <button onClick={saveImage} style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: 'none',
          background: 'rgba(99,102,241,0.15)',
          color: '#a78bfa',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 13
        }}>⬇️ Save</button>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

        {/* Camera Button */}
        {!cameraOn ? (
          <button onClick={startCamera} style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(34,197,94,0.15)',
            color: '#4ade80',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13
          }}>📷 Camera On</button>
        ) : (
          <button onClick={stopCamera} style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#16a34a',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13
          }}>📷 Stop Camera</button>
        )}

        {/* Screen Share Button */}
        {!screenSharing ? (
          <button onClick={startScreenShare} style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(14,165,233,0.15)',
            color: '#38bdf8',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13
          }}>🖥️ Share Screen</button>
        ) : (
          <button onClick={stopScreenShare} style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#0ea5e9',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13
          }}>🖥️ Stop Share</button>
        )}

      </div>

      {/* CANVAS AREA */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />

        {/* CAMERA BOX */}
        {cameraOn && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 220,
            height: 165,
            background: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid #6366f1',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 20
          }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 8, left: 8,
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6
            }}>📷 Camera</div>
            <button
              onClick={stopCamera}
              style={{
                position: 'absolute',
                top: 6, right: 6,
                background: 'rgba(239,68,68,0.9)',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                cursor: 'pointer'
              }}>✕</button>
          </div>
        )}

        {/* Screen share badge */}
        {screenSharing && (
          <div style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(14,165,233,0.9)',
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            padding: '7px 16px',
            borderRadius: 50,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: 'white',
              animation: 'pulse 1s infinite'
            }} />
            Screen Sharing...
            <button
              onClick={stopScreenShare}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                padding: '2px 10px',
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: 6
              }}>Stop</button>
          </div>
        )}

        {/* Error message */}
        {(cameraError || screenError) && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            border: '1px solid #ef4444',
            color: '#f87171',
            fontSize: 13,
            fontWeight: 500,
            padding: '10px 18px',
            borderRadius: 10,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            {cameraError || screenError}
            <button
              onClick={() => { setCameraError(''); setScreenError('') }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 16
              }}>✕</button>
          </div>
        )}

        {/* Empty hint */}
        {!screenSharing && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
            textAlign: 'center',
            opacity: 0.1
          }}>
            <div style={{ fontSize: 56 }}>✏️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              Start drawing!
            </div>
          </div>
        )}

      </div>
    </div>
  )
}