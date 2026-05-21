'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ManageLessons() {
  const [courses, setCourses] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('Courses').select('*')
      setCourses(data || [])
    }
    load()
  }, [])

  const loadLessons = async (courseId: string) => {
    setSelectedCourse(courseId)
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index')
    setLessons(data || [])
  }

  const handleAddLesson = async () => {
    if (!selectedCourse || !title) {
      setMessage('Please select a course and enter a title!')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('lessons').insert([{
      course_id: selectedCourse,
      title,
      description,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      order_index: lessons.length,
    }])
    if (error) { setMessage('Error: ' + error.message) }
    else {
      setMessage('✅ Lesson added!')
      setTitle(''); setDescription(''); setVideoUrl(''); setPdfUrl('')
      loadLessons(selectedCourse)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📝 Manage Lessons</h1>
          <button onClick={() => router.push('/teacher')}
            className="text-blue-600 hover:underline">← Back</button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Course</h2>
          <select onChange={e => loadLessons(e.target.value)} value={selectedCourse}
            className="w-full border border-gray-300 rounded-lg px-4 py-3">
            <option value="">-- Choose a course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Add New Lesson</h2>
              {message && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">{message}</div>}
              <div className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Lesson Title *"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"/>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Lesson description" rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"/>
                <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                  placeholder="Video URL (YouTube or other)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"/>
                <input type="text" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)}
                  placeholder="PDF URL (Google Drive or other)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"/>
                <button onClick={handleAddLesson} disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Adding...' : '+ Add Lesson'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Lessons ({lessons.length})
              </h2>
              {lessons.length === 0 && <p className="text-gray-400">No lessons yet.</p>}
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="border-b border-gray-100 py-4">
                  <p className="font-semibold">{i + 1}. {lesson.title}</p>
                  <p className="text-gray-500 text-sm">{lesson.description}</p>
                  {lesson.video_url && <p className="text-blue-500 text-sm mt-1">🎥 Video attached</p>}
                  {lesson.pdf_url && <p className="text-red-500 text-sm">📄 PDF attached</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}