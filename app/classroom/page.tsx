'use client'
import { useState } from 'react'

export default function ClassroomPage() {
  const [roomName, setRoomName] = useState('')
  const [joined, setJoined] = useState(false)

  const joinClass = () => {
    if (!roomName) return
    setJoined(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Live Classroom</h1>
      {!joined ? (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded shadow mt-20">
          <h2 className="text-xl font-semibold mb-4">Enter Classroom</h2>
          <input
            className="w-full p-2 rounded text-black mb-4"
            placeholder="Enter room name (e.g. math-class)"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
          <button
            onClick={joinClass}
            className="bg-blue-600 w-full py-2 rounded hover:bg-blue-700 font-semibold">
            Join Live Class
          </button>
        </div>
      ) : (
        <div className="w-full" style={{height: '85vh'}}>
          <iframe
            src={`https://meet.jit.si/learnhub-${roomName}`}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            style={{width: '100%', height: '100%', border: 'none', borderRadius: '8px'}}
          />
        </div>
      )}
    </div>
  )
}
