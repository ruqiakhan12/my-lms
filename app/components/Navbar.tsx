'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

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
    <nav className="bg-blue-700 text-white px-6 py-3 flex flex-wrap justify-between items-center gap-2">
      <Link href="/" className="text-xl font-bold">LearnHub</Link>
      <div className="flex flex-wrap gap-3 items-center text-sm">
        <Link href="/courses" className="hover:underline">Courses</Link>
        <Link href="/assignments" className="hover:underline">Assignments</Link>
        <Link href="/grades" className="hover:underline">Grades</Link>
        <Link href="/progress" className="hover:underline">Progress</Link>
        <Link href="/classroom" className="hover:underline">Live Class</Link>
        <Link href="/teacher" className="hover:underline">Teacher</Link>
        {user ? (
          <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
        ) : (
          <Link href="/login" className="bg-white text-blue-700 px-3 py-1 rounded">Login</Link>
        )}
      </div>
    </nav>
  )
}
