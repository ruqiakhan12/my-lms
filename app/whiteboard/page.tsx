'use client'
import { useEffect, useRef, useState } from 'react'

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoFileRef = useRef<HTMLInputElement>(null)

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

  // IMAGE UPLOAD onto canvas
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        // Center image on canvas
        const x = (canvas.width - img.width) / 2
        const y = (canvas.height - img.height) / 2
        ctx.drawImage(img, x > 0 ? x : 0, y > 0 ? y : 0,
          Math.min(img.width, canvas.width),
          Math.min(img.height, canvas.height))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // VIDEO FILE UPLOAD
  const handleVideoUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setUploadedVideo(url)
    setVideoType('file')
    setShowVideoPanel(true)
  }

  // YOUTUBE
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

  // CAMERA
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
        setCameraError('Camera allow karo browser mein!')
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
    padding: '6px 12px',
    borderRadius: 7,
    border: 'none',
    background: active ? '#6366f1' : (bg || 'rgba(255,255,255,0.08)'),
    color: active ? 'white' : (bg ? 'white' : 'rgba(255,255,255,0.8)'),
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 12,
    whiteSpace: 'nowrap' as const
  })

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
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>
          🎓 Whiteboard
        </span>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Tools */}
        <button onClick={() => setTool('pen')} style={btnStyle(tool === 'pen')}>✏️ Pen</button>
        <button onClick={() => setTool('eraser')} style={btnStyle(tool === 'eraser')}>🧹 Eraser</button>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Colors */}
        {colors.map(c => (
          <div key={c} onClick={() => { setColor(c); setTool('pen') }}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: c, cursor: 'pointer',
              border: color === c ? '3px solid white' : c === '#ffffff' ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
              transform: color === c ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.15s', flexShrink: 0
            }} />
        ))}

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Size */}
        <input type="range" min={1} max={12} value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))}
          style={{ width: 70, accentColor: '#6366f1' }} />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{lineWidth}px</span>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Actions */}
        <button onClick={clearCanvas} style={btnStyle(false, 'rgba(239,68,68,0.3)')}>🗑️ Clear</button>
        <button onClick={saveImage} style={btnStyle(false, 'rgba(99,102,241,0.3)')}>⬇️ Save</button>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Image Upload */}
        <button onClick={() => fileInputRef.current?.click()}
          style={btnStyle(false, 'rgba(34,197,94,0.25)')}>
          🖼️ Add Image
        </button>
        <input ref={fileInputRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handleImageUpload} />

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Video Upload */}
        <button onClick={() => videoFileRef.current?.click()}
          style={btnStyle(false, 'rgba(251,146,60,0.3)')}>
          📹 Video Upload
        </button>
        <input ref={videoFileRef} type="file" accept="video/*"
          style={{ display: 'none' }} onChange={handleVideoUpload} />

        {/* YouTube */}
        <input
          type="text"
          placeholder="YouTube link..."
          value={youtubeInput}
          onChange={e => setYoutubeInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadYoutube()}
          style={{
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'white', fontSize: 12, width: 160,
            outline: 'none'
          }}
        />
        <button onClick={loadYoutube} style={btnStyle(false, 'rgba(239,68,68,0.35)')}>
          ▶️ YouTube
        </button>

        {showVideoPanel && (
          <button onClick={() => setShowVideoPanel(false)}
            style={btnStyle(false, 'rgba(239,68,68,0.3)')}>
            ✕ Close Video
          </button>
        )}

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />

        {/* Camera */}
        {!cameraOn ? (
          <button onClick={startCamera} style={btnStyle(false, 'rgba(34,197,94,0.25)')}>
            📷 Camera On
          </button>
        ) : (
          <button onClick={stopCamera} style={btnStyle(true)}>
            📷 Stop Camera
          </button>
        )}
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* CANVAS */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%', height: '100%',
              display: 'block', cursor: 'crosshair',
              touchAction: 'none', background: 'white'
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />

          {/* Camera Box */}
          {cameraOn && (
            <div style={{
              position: 'absolute', bottom: 16, right: 16,
              width: 220, height: 165,
              background: '#000', borderRadius: 12,
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

          {/* Camera Error */}
          {cameraError && (
            <div style={{
              position: 'absolute', bottom: 16, left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e293b', border: '1px solid #ef4444',
              color: '#f87171', fontSize: 13, padding: '10px 16px',
              borderRadius: 10, zIndex: 30
            }}>
              {cameraError}
              <button onClick={() => setCameraError('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 8 }}>✕</button>
            </div>
          )}

          {/* Empty hint */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none', textAlign: 'center', opacity: 0.08
          }}>
            <div style={{ fontSize: 56 }}>✏️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Start drawing!</div>
          </div>
        </div>

        {/* VIDEO PANEL - Side mein */}
        {showVideoPanel && (
          <div style={{
            width: 360,
            background: '#1e293b',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                📹 Video Panel
              </span>
              <button onClick={() => setShowVideoPanel(false)}
                style={{
                  background: 'rgba(239,68,68,0.2)', border: 'none',
                  borderRadius: 6, color: '#f87171',
                  fontSize: 12, fontWeight: 700,
                  padding: '4px 10px', cursor: 'pointer'
                }}>✕ Close</button>
            </div>

            <div style={{ flex: 1, padding: 16 }}>
              {videoType === 'youtube' && videoUrl && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>
                    ▶️ YouTube Video
                  </p>
                  <iframe
                    width="100%"
                    height="200"
                    src={videoUrl}
                    style={{ borderRadius: 10, border: 'none' }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                  {/* YouTube input again */}
                  <div style={{ marginTop: 16 }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>
                      Dusra video load karo:
                    </p>
                    <input
                      type="text"
                      placeholder="YouTube link paste karo..."
                      value={youtubeInput}
                      onChange={e => setYoutubeInput(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px',
                        borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'white', fontSize: 13, outline: 'none',
                        marginBottom: 8
                      }}
                    />
                    <button onClick={loadYoutube} style={{
                      width: '100%', padding: '9px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none', borderRadius: 8,
                      color: 'white', fontWeight: 700,
                      fontSize: 13, cursor: 'pointer'
                    }}>▶️ Load Video</button>
                  </div>
                </div>
              )}

              {videoType === 'file' && uploadedVideo && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10 }}>
                    📹 Uploaded Video
                  </p>
                  <video
                    src={uploadedVideo}
                    controls
                    style={{
                      width: '100%', borderRadius: 10,
                      background: '#000'
                    }}
                  />
                  <button
                    onClick={() => videoFileRef.current?.click()}
                    style={{
                      width: '100%', marginTop: 12, padding: '9px',
                      background: 'rgba(251,146,60,0.2)',
                      border: '1px solid rgba(251,146,60,0.4)',
                      borderRadius: 8, color: '#fb923c',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>
                    📁 Dusra Video Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}