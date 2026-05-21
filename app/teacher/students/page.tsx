'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function StudentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: enrollData } = await supabase
        .from('enrollments')
        .select('*, Courses(title)')
      const { data: gradesData } = await supabase
        .from('grades')
        .select('*, assignments(title)')
      setEnrollments(enrollData || [])
      setGrades(gradesData || [])
      setLoading(false)
    }
    getData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Student Tracking</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500 text-white p-6 rounded-xl text-center">
            <p className="text-4xl font-bold">{new Set(enrollments.map(e => e.student_id)).size}</p>
            <p>Total Students</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-xl text-center">
            <p className="text-4xl font-bold">{enrollments.length}</p>
            <p>Total Enrollments</p>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-xl text-center">
            <p className="text-4xl font-bold">{grades.length}</p>
            <p>Total Submissions</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">All Enrollments</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student Email</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Enrolled At</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 text-sm">{e.student_id}</td>
                  <td className="p-3 text-sm">{e.Courses?.title}</td>
                  <td className="p-3 text-sm">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4">Assignment Submissions</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Assignment</th>
                <th className="p-3 text-left">Answer</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 && (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">No submissions yet</td></tr>
              )}
              {grades.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-3 text-sm">{g.student_id}</td>
                  <td className="p-3 text-sm">{g.assignments?.title}</td>
                  <td className="p-3 text-sm">{g.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
