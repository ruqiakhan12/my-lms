'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="bg-blue-700 text-white px-4 py-3">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">🎓 LearnHub</Link>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl">☰</button>
      </div>
      {open && (
        <div className="flex flex-col gap-2 mt-3 text-sm">
          <Link href="/courses" onClick={() => setOpen(false)} className="hover:underline">📚 Courses</Link>
          <Link href="/assignments" onClick={() => setOpen(false)} className="hover:underline">📝 Assignments</Link>
          <Link href="/grades" onClick={() => setOpen(false)} className="hover:underline">🏆 Grades</Link>
          <Link href="/progress" onClick={() => setOpen(false)} className="hover:underline">📊 Progress</Link>
          <Link href="/certificate" onClick={() => setOpen(false)} className="hover:underline">🎓 Certificate</Link>
          <Link href="/calendar" onClick={() => setOpen(false)} className="hover:underline">📅 Calendar</Link>
          <Link href="/classroom" onClick={() => setOpen(false)} className="hover:underline">📹 Live Class</Link>
          <Link href="/whiteboard" onClick={() => setOpen(false)} className="hover:underline">🖊️ Whiteboard</Link>
          <Link href="/forum" onClick={() => setOpen(false)} className="hover:underline">💬 Forum</Link>
          <Link href="/analytics" onClick={() => setOpen(false)} className="hover:underline">📈 Analytics</Link>
          <Link href="/teacher" onClick={() => setOpen(false)} className="hover:underline">👨‍🏫 Teacher Dashboard</Link>
          <Link href="/teacher/portfolio" onClick={() => setOpen(false)} className="hover:underline">🌟 Teacher Portfolio</Link>
          {user ? (
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded text-left">🚪 Logout</button>
          ) : (
            <Link href="/login" className="bg-white text-blue-700 px-3 py-1 rounded">Login</Link>
          )}
        </div>
      )}
    </nav>
  )
}
