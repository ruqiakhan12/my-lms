'use client'
import { useEffect, useRef, useState } from 'react'

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(4)
  const [tool, setTool] = useState('pen')
  const [roomName, setRoomName] = useState('')
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 50, 50, 400, 300)
            URL.revokeObjectURL(url)
          }
          img.src = url
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const getPos = (e: any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: any) => {
    setDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: any) => {
    if (!drawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineWidth = tool === 'eraser' ? 20 : size
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => setDrawing(false)

  const clearBoard = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const colors = ['#000000', '#ff0000', '#0000ff', '#00aa00', '#ff6600', '#9900cc']

  return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#1a1a2e'}}>
      <div style={{background: '#16213e', color: 'white', padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
        <span style={{fontWeight: 'bold'}}>🖊️ Whiteboard</span>
        <div style={{display: 'flex', gap: '4px'}}>
          {colors.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen') }}
              style={{backgroundColor: c, border: color === c && tool === 'pen' ? '3px solid yellow' : '2px solid gray', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer'}}/>
          ))}
        </div>
        <input type="range" min="1" max="20" value={size} onChange={e => setSize(Number(e.target.value))} style={{width: '80px'}}/>
        <button onClick={() => setTool('pen')} style={{background: tool === 'pen' ? '#3b82f6' : '#4b5563', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer'}}>✏️ Pen</button>
        <button onClick={() => setTool('eraser')} style={{background: tool === 'eraser' ? '#3b82f6' : '#4b5563', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer'}}>🧹 Eraser</button>
        <button onClick={clearBoard} style={{background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer'}}>🗑️ Clear</button>
        <span style={{color: '#9ca3af', fontSize: '12px'}}>📋 Ctrl+V to paste image</span>
        {!showVideo ? (
          <div style={{display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto'}}>
            <input style={{color: 'black', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}} placeholder="Room name" value={roomName} onChange={e => setRoomName(e.target.value)} />
            <button onClick={() => roomName && setShowVideo(true)} style={{background: '#16a34a', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer'}}>📹 Start Video</button>
          </div>
        ) : (
          <button onClick={() => setShowVideo(false)} style={{background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto'}}>❌ Stop Video</button>
        )}
      </div>
      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        <canvas
          ref={canvasRef}
          style={{background: 'white', cursor: 'crosshair', width: showVideo ? '65%' : '100%', height: '100%', display: 'block'}}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
        />
        {showVideo && (
          <iframe
            src={`https://meet.jit.si/learnhub-${roomName}`}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            style={{width: '35%', height: '100%', border: 'none'}}
          />
        )}
      </div>
    </div>
  )
}
