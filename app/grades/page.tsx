'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('grades')
          .select('*, assignments(title, description)')
          .eq('student_id', user.id)
        setGrades(data || [])
      }
    }
    getData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Grades</h1>
        {grades.length === 0 && <p className="text-gray-400 text-center py-12">No grades yet. Submit assignments first!</p>}
        <div className="flex flex-col gap-4">
          {grades.map((grade) => (
            <div key={grade.id} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-1">{grade.assignments?.title}</h2>
              <p className="text-gray-500 mb-3">{grade.assignments?.description}</p>
              <div className="flex gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded">
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="text-2xl font-bold text-blue-600">{grade.grade ?? 'Not graded yet'}</p>
                </div>
                {grade.feedback && (
                  <div className="bg-green-50 px-4 py-2 rounded flex-1">
                    <p className="text-sm text-gray-500">Teacher Feedback</p>
                    <p className="text-green-700">{grade.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
