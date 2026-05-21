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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🏫 Teacher Dashboard
          </h1>
          <Link href="/teacher/create-course"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
            + Create New Course
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-4xl font-bold text-blue-600">{courses.length}</p>
            <p className="text-gray-600 mt-1">Total Courses</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-4xl font-bold text-green-600">0</p>
            <p className="text-gray-600 mt-1">Students Enrolled</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-4xl font-bold text-purple-600">0</p>
            <p className="text-gray-600 mt-1">Assignments</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
              <p className="text-gray-500 mt-1">{course.description}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/teacher/create-course?edit=${course.id}`}
                  className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50">
                  Edit Course
                </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-400 col-span-2 text-center py-12">
              No courses yet. Click "Create New Course" to start!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}