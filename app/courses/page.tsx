'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: coursesData } = await supabase.from('Courses').select('*')
      setCourses(coursesData || [])
      if (user) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id)
        setEnrolledCourses(enrollments?.map(e => e.course_id) || [])
      }
    }
    getData()
  }, [])

  const enroll = async (courseId: string) => {
    if (!user) { setMessage('Please login first!'); return }
    const { error } = await supabase.from('enrollments').insert({
      student_id: user.id,
      course_id: courseId
    })
    if (error) { setMessage('Already enrolled or error!'); return }
    setEnrolledCourses([...enrolledCourses, courseId])
    setMessage('Enrolled successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📚 Available Courses</h1>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        <div className="grid grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">{course.title}</h2>
              <p className="text-gray-500 mb-4">{course.description}</p>
              {enrolledCourses.includes(course.id) ? (
                <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                  ✅ Enrolled
                </button>
              ) : (
                <button
                  onClick={() => enroll(course.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Enroll Now
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
