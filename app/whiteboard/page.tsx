'use client'
import { useEffect, useRef, useState } from 'react'

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(4)
  const [tool, setTool] = useState('pen')

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

  const getPos = (e: any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
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

  const colors = ['#000000', '#ff0000', '#0000ff', '#00aa00', '#ff6600', '#9900cc', '#ffffff']

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 flex flex-wrap gap-3 items-center">
        <h1 className="font-bold text-lg">Whiteboard</h1>
        <div className="flex gap-1">
          {colors.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen') }}
              style={{backgroundColor: c, border: color === c && tool === 'pen' ? '3px solid yellow' : '2px solid gray'}}
              className="w-7 h-7 rounded-full"/>
          ))}
        </div>
        <input type="range" min="1" max="20" value={size} onChange={e => setSize(Number(e.target.value))} className="w-24"/>
        <button onClick={() => setTool('pen')} className={`px-3 py-1 rounded text-sm ${tool === 'pen' ? 'bg-blue-500' : 'bg-gray-600'}`}>✏️ Pen</button>
        <button onClick={() => setTool('eraser')} className={`px-3 py-1 rounded text-sm ${tool === 'eraser' ? 'bg-blue-500' : 'bg-gray-600'}`}>🧹 Eraser</button>
        <button onClick={clearBoard} className="bg-red-600 px-3 py-1 rounded text-sm">🗑️ Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 bg-white cursor-crosshair"
        style={{width: '100%', height: 'calc(100vh - 60px)'}}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
      />
    </div>
  )
}
