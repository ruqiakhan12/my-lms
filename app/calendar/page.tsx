'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CalendarPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [room, setRoom] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase
        .from('scheduled_classes')
        .select('*')
        .order('date', { ascending: true })
      setClasses(data || [])
    }
    getData()
  }, [])

  const schedule = async () => {
    if (!title || !date || !time || !room) { setMessage('Please fill all fields!'); return }
    const { error } = await supabase.from('scheduled_classes').insert({
      title, date, time, room_name: room, created_by: user?.id
    })
    if (error) { setMessage('Error scheduling class!'); return }
    setMessage('Class scheduled successfully!')
    setTitle(''); setDate(''); setTime(''); setRoom('')
    setShowForm(false)
    const { data } = await supabase.from('scheduled_classes').select('*').order('date', { ascending: true })
    setClasses(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📅 Class Schedule</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Schedule Class
          </button>
        </div>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Schedule New Class</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Class Title</label>
                <input className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Math Lecture 1" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Room Name</label>
                <input className="w-full border rounded p-2" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. math-class" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Date</label>
                <input type="date" className="w-full border rounded p-2" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold mb-1">Time</label>
                <input type="time" className="w-full border rounded p-2" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
            <button onClick={schedule} className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full">
              Schedule Class
            </button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {classes.length === 0 && <p className="text-gray-400 text-center py-12">No classes scheduled yet.</p>}
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded shadow flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{cls.title}</h3>
                <p className="text-gray-500">📅 {cls.date} at 🕐 {cls.time}</p>
                <p className="text-gray-500">🚪 Room: {cls.room_name}</p>
              </div>
              <a href={`/classroom`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Join Class
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
