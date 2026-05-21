'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('Courses').select('*')
      setCourses(data || [])
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🎓 Teacher Dashboard</h1>
          <Link href="/teacher/create-course">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              + Create New Course
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-3xl font-bold">{courses.length}</p>
            <p className="text-gray-500">Total Courses</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-3xl font-bold">0</p>
            <p className="text-gray-500">Students Enrolled</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-3xl font-bold">0</p>
            <p className="text-gray-500">Assignments</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        <div className="grid grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded shadow">
              <h3 className="font-bold text-lg mb-1">{course.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{course.description}</p>
              <div className="flex gap-2">
                <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 text-sm">
                  Edit Course
                </button>
                <Link href="/teacher/lessons">
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
                    Manage Lessons
                  </button>
                </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-400 col-span-2 text-center py-8">
              No courses yet. Click "Create New Course" to start!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
