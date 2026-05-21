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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 flex flex-wrap gap-3 items-center">
        <h1 className="font-bold">🖊️ Whiteboard</h1>
        <div className="flex gap-1">
          {colors.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen') }}
              style={{backgroundColor: c, border: color === c ? '3px solid yellow' : '2px solid gray'}}
              className="w-7 h-7 rounded-full"/>
          ))}
        </div>
        <input type="range" min="1" max="20" value={size} onChange={e => setSize(Number(e.target.value))} className="w-20"/>
        <button onClick={() => setTool('pen')} className={`px-2 py-1 rounded text-xs ${tool === 'pen' ? 'bg-blue-500' : 'bg-gray-600'}`}>✏️ Pen</button>
        <button onClick={() => setTool('eraser')} className={`px-2 py-1 rounded text-xs ${tool === 'eraser' ? 'bg-blue-500' : 'bg-gray-600'}`}>🧹 Eraser</button>
        <button onClick={clearBoard} className="bg-red-600 px-2 py-1 rounded text-xs">🗑️ Clear</button>
        <span className="text-gray-400 text-xs">📋 Ctrl+V to paste image</span>
        {!showVideo ? (
          <div className="flex gap-2 items-center ml-auto">
            <input className="text-black px-2 py-1 rounded text-xs" placeholder="Room name" value={roomName} onChange={e => setRoomName(e.target.value)} />
            <button onClick={() => roomName && setShowVideo(true)} className="bg-green-600 px-2 py-1 rounded text-xs">📹 Start Video</button>
          </div>
        ) : (
          <button onClick={() => setShowVideo(false)} className="bg-red-600 px-2 py-1 rounded text-xs ml-auto">❌ Stop Video</button>
        )}
      </div>
      <div className="flex flex-1" style={{height: 'calc(100vh - 55px)'}}>
        <canvas
          ref={canvasRef}
          className="bg-white cursor-crosshair"
          style={{width: showVideo ? '65%' : '100%', height: '100%'}}
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
