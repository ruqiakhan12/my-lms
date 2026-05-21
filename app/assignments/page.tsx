'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [answers, setAnswers] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: assignmentsData } = await supabase.from('assignments').select('*')
      setAssignments(assignmentsData || [])
      if (user) {
        const { data: gradesData } = await supabase.from('grades').select('assignment_id').eq('student_id', user.id)
        setSubmissions(gradesData?.map(g => g.assignment_id) || [])
      }
    }
    getData()
  }, [])

  const submit = async (assignmentId: string) => {
    if (!user) { setMessage('Please login first!'); return }
    if (!answers[assignmentId]) { setMessage('Please write your answer first!'); return }
    const { error } = await supabase.from('grades').insert({ student_id: user.id, assignment_id: assignmentId, feedback: answers[assignmentId] })
    if (error) { setMessage('Already submitted or error!'); return }
    setSubmissions([...submissions, assignmentId])
    setMessage('Assignment submitted successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Assignments</h1>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        {assignments.length === 0 && <p className="text-gray-400 text-center py-12">No assignments yet.</p>}
        <div className="flex flex-col gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-2">{assignment.title}</h2>
              <p className="text-gray-500 mb-4">{assignment.description}</p>
              {submissions.includes(assignment.id) ? (
                <p className="text-green-600 font-semibold">Submitted</p>
              ) : (
                <>
                  <textarea className="w-full border rounded p-3 mb-3 h-32" placeholder="Write your answer here..." onChange={(e) => setAnswers({...answers, [assignment.id]: e.target.value})} />
                  <button onClick={() => submit(assignment.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit Assignment</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
