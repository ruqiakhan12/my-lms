'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

type FloatingImage = {
  id: number
  img: HTMLImageElement
  x: number
  y: number
  width: number
  height: number
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const [showVideoPanel, setShowVideoPanel] = useState(false)
  const [videoType, setVideoType] = useState<'youtube' | 'file' | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)

  // ── NEW: Floating images state ──
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null)
  const dragInfo = useRef<{ offsetX: number; offsetY: number } | null>(null)
  const resizeInfo = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)
  const isDragging = useRef(false)
  const isResizing = useRef(false)

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

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const getPos = (e: any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const startDraw = (e: any) => {
    if (selectedImageId !== null) return
    e.preventDefault()
    setIsDrawing(true)
    lastPos.current = getPos(e)
  }

  const draw = (e: any) => {
    if (selectedImageId !== null) return
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
    setFloatingImages([])
    setSelectedImageId(null)
  }

  const saveImage = () => {
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvasRef.current!.toDataURL()
    link.click()
  }

  // ── NEW: Image upload → small floating box ──
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const container = containerRef.current!
        // Always open image at max 280px wide — never full screen!
        const maxW = 280
        const maxH = 200
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        // Place in center of canvas
        const x = (container.offsetWidth - w) / 2
        const y = (container.offsetHeight - h) / 2
        const newImg: FloatingImage = {
          id: Date.now(), img, x, y, width: w, height: h
        }
        setFloatingImages(prev => [...prev, newImg])
        setSelectedImageId(newImg.id)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Stamp image permanently onto canvas
  const stampImage = (id: number) => {
    const fi = floatingImages.find(f => f.id === id)
    if (!fi) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    ctx.drawImage(fi.img, fi.x * scaleX, fi.y * scaleY, fi.width * scaleX, fi.height * scaleY)
    setFloatingImages(prev => prev.filter(f => f.id !== id))
    setSelectedImageId(null)
  }

  const deleteImage = (id: number) => {
    setFloatingImages(prev => prev.filter(f => f.id !== id))
    setSelectedImageId(null)
  }

  // ── NEW: Drag image ──
  const onImageMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedImageId(id)
    const fi = floatingImages.find(f => f.id === id)!
    isDragging.current = true
    dragInfo.current = { offsetX: e.clientX - fi.x, offsetY: e.clientY - fi.y }
  }

  // ── NEW: Resize image ──
  const onResizeMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setSelectedImageId(id)
    const fi = floatingImages.find(f => f.id === id)!
    isResizing.current = true
    resizeInfo.current = {
      startX: e.clientX, startY: e.clientY,
      startW: fi.width, startH: fi.height
    }
  }

  const onMouseMoveGlobal = useCallback((e: MouseEvent) => {
    if (isDragging.current && dragInfo.current && selectedImageId !== null) {
      setFloatingImages(prev => prev.map(f =>
        f.id === selectedImageId
          ? { ...f, x: e.clientX - dragInfo.current!.offsetX, y: e.clientY - dragInfo.current!.offsetY }
          : f
      ))
    }
    if (isResizing.current && resizeInfo.current && selectedImageId !== null) {
      const dw = e.clientX - resizeInfo.current.startX
      const dh = e.clientY - resizeInfo.current.startY
      setFloatingImages(prev => prev.map(f =>
        f.id === selectedImageId
          ? { ...f, width: Math.max(60, resizeInfo.current!.startW + dw), height: Math.max(40, resizeInfo.current!.startH + dh) }
          : f
      ))
    }
  }, [selectedImageId])

  const onMouseUpGlobal = useCallback(() => {
    isDragging.current = false
    isResizing.current = false
    dragInfo.current = null
    resizeInfo.current = null
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMoveGlobal)
    window.addEventListener('mouseup', onMouseUpGlobal)
    return () => {
      window.removeEventListener('mousemove', onMouseMoveGlobal)
      window.removeEventListener('mouseup', onMouseUpGlobal)
    }
  }, [onMouseMoveGlobal, onMouseUpGlobal])

  // ── VIDEO FILE UPLOAD (your original code) ──
  const handleVideoUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUploadedVideo(url)
    setVideoType('file')
    setShowVideoPanel(true)
  }

  // ── YOUTUBE (your original code — working!) ──
  const loadYoutube = () => {
    if (!youtubeInput) return
    let videoId = ''
    if (youtubeInput.includes('v=')) {
      videoId = youtubeInput.split('v=')[1].split('&')[0]
    } else if (youtubeInput.includes('youtu.be/')) {
      videoId = youtubeInput.split('youtu.be/')[1]
    } else {
      videoId = youtubeInput
    }
    setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`)
    setVideoType('youtube')
    setShowVideoPanel(true)
  }

  // ── CAMERA (your original code) ──
  const startCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 280, height: 200, facingMode: 'user' },
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
        setCameraError('Camera blocked! Click the 🔒 lock icon in address bar → set Camera to Allow → refresh page.')
      } else {
        setCameraError('Camera error: ' + err.message)
      }
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }

  const colors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

  const btnStyle = (active: boolean, bg?: string) => ({
    padding: '6px 12px', borderRadius: 7, border: 'none',
    background: active ? '#6366f1' : (bg || 'rgba(255,255,255,0.08)'),
    color: active ? 'white' : (bg ? 'white' : 'rgba(255,255,255,0.8)'),
    fontWeight: 600, cursor: 'pointer', fontSize: 12,
    whiteSpace: 'nowrap' as const
  })

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#0f172a', fontFamily: 'sans-serif'
    }}>

      {/* TOOLBAR — exactly your original */}
      <div style={{
        background: '#1e293b', padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0
      }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>🎓 Whiteboard</span>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        <button onClick={() => setTool('pen')} style={btnStyle(tool === 'pen')}>✏️ Pen</button>
        <button onClick={() => setTool('eraser')} style={btnStyle(tool === 'eraser')}>🧹 Eraser</button>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {colors.map(c => (
          <div key={c} onClick={() => { setColor(c); setTool('pen') }} style={{
            width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer',
            border: color === c ? '3px solid white' : c === '#ffffff' ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
            transform: color === c ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s', flexShrink: 0
          }} />
        ))}

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
        <input type="range" min={1} max={12} value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))}
          style={{ width: 70, accentColor: '#6366f1' }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{lineWidth}px</span>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        <button onClick={clearCanvas} style={btnStyle(false, 'rgba(239,68,68,0.3)')}>🗑️ Clear</button>
        <button onClick={saveImage} style={btnStyle(false, 'rgba(99,102,241,0.3)')}>⬇️ Save</button>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        <button onClick={() => fileInputRef.current?.click()}
          style={btnStyle(false, 'rgba(34,197,94,0.25)')}>🖼️ Add Image</button>
        <input ref={fileInputRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handleImageUpload} />
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        <button onClick={() => videoFileRef.current?.click()}
          style={btnStyle(false, 'rgba(251,146,60,0.3)')}>📹 Video Upload</button>
        <input ref={videoFileRef} type="file" accept="video/*"
          style={{ display: 'none' }} onChange={handleVideoUpload} />

        <input type="text" placeholder="YouTube link..."
          value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadYoutube()}
          style={{
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white', fontSize: 12, width: 160, outline: 'none'
          }} />
        <button onClick={loadYoutube} style={btnStyle(false, 'rgba(239,68,68,0.35)')}>▶️ YouTube</button>

        {showVideoPanel && (
          <button onClick={() => setShowVideoPanel(false)}
            style={btnStyle(false, 'rgba(239,68,68,0.3)')}>✕ Close Video</button>
        )}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {!cameraOn
          ? <button onClick={startCamera} style={btnStyle(false, 'rgba(34,197,94,0.25)')}>📷 Camera On</button>
          : <button onClick={stopCamera} style={btnStyle(true)}>📷 Stop Camera</button>
        }
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* CANVAS + floating images */}
        <div ref={containerRef}
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          onClick={() => setSelectedImageId(null)}>

          <canvas ref={canvasRef}
            style={{
              width: '100%', height: '100%', display: 'block',
              cursor: selectedImageId !== null ? 'default' : 'crosshair',
              touchAction: 'none', background: 'white'
            }}
            onMouseDown={startDraw} onMouseMove={draw}
            onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />

          {/* ── FLOATING IMAGES ── */}
          {floatingImages.map(fi => (
            <div key={fi.id}
              onMouseDown={e => onImageMouseDown(e, fi.id)}
              style={{
                position: 'absolute', left: fi.x, top: fi.y,
                width: fi.width, height: fi.height,
                border: selectedImageId === fi.id ? '2px dashed #6366f1' : '2px dashed transparent',
                cursor: 'move', boxSizing: 'border-box',
                userSelect: 'none', zIndex: 10
              }}>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fi.img.src} alt="uploaded"
                style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', pointerEvents: 'none' }} />

              {selectedImageId === fi.id && (
                <>
                  {/* Place button */}
                  <button onClick={e => { e.stopPropagation(); stampImage(fi.id) }}
                    style={{
                      position: 'absolute', top: -28, left: 0,
                      background: '#22c55e', border: 'none', borderRadius: 5,
                      color: 'white', fontSize: 11, fontWeight: 700,
                      padding: '3px 9px', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>✔ Place on Board</button>

                  {/* Delete button */}
                  <button onClick={e => { e.stopPropagation(); deleteImage(fi.id) }}
                    style={{
                      position: 'absolute', top: -28, right: 0,
                      background: '#ef4444', border: 'none', borderRadius: 5,
                      color: 'white', fontSize: 11, fontWeight: 700,
                      padding: '3px 9px', cursor: 'pointer'
                    }}>✕ Delete</button>

                  {/* Resize handle — purple dot bottom right */}
                  <div onMouseDown={e => onResizeMouseDown(e, fi.id)}
                    style={{
                      position: 'absolute', bottom: -8, right: -8,
                      width: 18, height: 18, background: '#6366f1',
                      borderRadius: '50%', cursor: 'nwse-resize',
                      border: '2px solid white', zIndex: 11
                    }} />
                </>
              )}
            </div>
          ))}

          {/* Camera Box — your original */}
          {cameraOn && (
            <div style={{
              position: 'absolute', bottom: 16, right: 16,
              width: 220, height: 165, background: '#000', borderRadius: 12,
              overflow: 'hidden', border: '2px solid #6366f1',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 20
            }}>
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <div style={{
                position: 'absolute', top: 7, left: 7,
                background: 'rgba(0,0,0,0.6)', color: 'white',
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5
              }}>📷 Camera</div>
              <button onClick={stopCamera} style={{
                position: 'absolute', top: 5, right: 5,
                background: 'rgba(239,68,68,0.85)', border: 'none',
                borderRadius: 5, color: 'white', fontSize: 10,
                fontWeight: 700, padding: '3px 7px', cursor: 'pointer'
              }}>✕</button>
            </div>
          )}

          {cameraError && (
            <div style={{
              position: 'absolute', bottom: 16, left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b', border: '1px solid #ef4444',
              color: '#f87171', fontSize: 13, padding: '10px 16px',
              borderRadius: 10, zIndex: 30, maxWidth: 400, textAlign: 'center'
            }}>
              {cameraError}
              <button onClick={() => setCameraError('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 8 }}>✕</button>
            </div>
          )}

          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none', textAlign: 'center', opacity: 0.08
          }}>
            <div style={{ fontSize: 56 }}>✏️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Start drawing!</div>
          </div>
        </div>

        {/* VIDEO PANEL — your original */}
        {showVideoPanel && (
          <div style={{
            width: 360, background: '#1e293b',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', flexShrink: 0
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>📹 Video Panel</span>
              <button onClick={() => setShowVideoPanel(false)} style={{
                background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 6,
                color: '#f87171', fontSize: 12, fontWeight: 700,
                padding: '4px 10px', cursor: 'pointer'
              }}>✕ Close</button>
            </div>

            <div style={{ flex: 1, padding: 16 }}>
              {videoType === 'youtube' && videoUrl && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>▶️ YouTube Video</p>
                  <iframe width="100%" height="200" src={videoUrl}
                    style={{ borderRadius: 10, border: 'none' }}
                    allow="autoplay; encrypted-media" allowFullScreen />
                  <div style={{ marginTop: 16 }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>Load another video:</p>
                    <input type="text" placeholder="Paste YouTube link..."
                      value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.08)', color: 'white',
                        fontSize: 13, outline: 'none', marginBottom: 8
                      }} />
                    <button onClick={loadYoutube} style={{
                      width: '100%', padding: '9px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none', borderRadius: 8, color: 'white',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>▶️ Load Video</button>
                  </div>
                </div>
              )}

              {videoType === 'file' && uploadedVideo && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>📹 Uploaded Video</p>
                  <video src={uploadedVideo} controls
                    style={{ width: '100%', borderRadius: 10, background: '#000' }} />
                  <button onClick={() => videoFileRef.current?.click()} style={{
                    width: '100%', marginTop: 12, padding: '9px',
                    background: 'rgba(251,146,60,0.2)',
                    border: '1px solid rgba(251,146,60,0.4)',
                    borderRadius: 8, color: '#fb923c',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}>📁 Upload Another Video</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}