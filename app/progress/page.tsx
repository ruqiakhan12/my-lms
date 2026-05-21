'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProgressPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState(0)
  const [assignments, setAssignments] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: enroll } = await supabase
          .from('enrollments')
          .select('*, Courses(title, description)')
          .eq('student_id', user.id)
        setEnrollments(enroll || [])
        const { data: grades } = await supabase
          .from('grades')
          .select('id')
          .eq('student_id', user.id)
        setSubmissions(grades?.length || 0)
        const { data: assign } = await supabase
          .from('assignments')
          .select('id')
        setAssignments(assign?.length || 0)
      }
    }
    getData()
  }, [])

  const percent = assignments > 0 ? Math.round((submissions / assignments) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Progress</h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
            <p className="text-gray-500">Courses Enrolled</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-3xl font-bold text-green-600">{submissions}</p>
            <p className="text-gray-500">Assignments Submitted</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-3xl font-bold text-purple-600">{percent}%</p>
            <p className="text-gray-500">Overall Progress</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        <div className="flex flex-col gap-4">
          {enrollments.length === 0 && <p className="text-gray-400 text-center py-8">No courses enrolled yet.</p>}
          {enrollments.map((enroll) => (
            <div key={enroll.id} className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold mb-1">{enroll.Courses?.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{enroll.Courses?.description}</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{width: percent + '%'}}></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{percent}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
