'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateAssignment() {
  const [courses, setCourses] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courseId, setCourseId] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getCourses = async () => {
      const { data } = await supabase.from('Courses').select('*')
      setCourses(data || [])
    }
    getCourses()
  }, [])

  const create = async () => {
    if (!title || !courseId) { setMessage('Please fill title and select a course!'); return }
    const { error } = await supabase.from('assignments').insert({ title, description, course_id: courseId })
    if (error) { setMessage('Error creating assignment!'); return }
    setMessage('Assignment created successfully!')
    setTitle('')
    setDescription('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📝 Create Assignment</h1>
        {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
        <div className="bg-white p-6 rounded shadow">
          <div className="mb-4">
            <label className="block font-semibold mb-1">Assignment Title</label>
            <input className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 1 Quiz" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Description</label>
            <textarea className="w-full border rounded p-2 h-28" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the assignment..." />
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-1">Select Course</label>
            <select className="w-full border rounded p-2" value={courseId} onChange={e => setCourseId(e.target.value)}>
              <option value="">-- Choose a course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <button onClick={create} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
            Create Assignment
          </button>
        </div>
        <button onClick={() => router.push('/teacher')} className="mt-4 text-blue-600 hover:underline">
          ← Back to Teacher Dashboard
        </button>
      </div>
    </div>
  )
}
