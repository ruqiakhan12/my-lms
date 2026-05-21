'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function CertificatePage() {
  const [user, setUser] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('enrollments')
          .select('*, Courses(title)')
          .eq('student_id', user.id)
        setEnrollments(data || [])
      }
    }
    getData()
  }, [])

  const printCert = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Certificates</h1>
        {!selected ? (
          <div>
            <p className="text-gray-500 mb-6">Select a course to generate your certificate:</p>
            {enrollments.length === 0 && <p className="text-gray-400">No enrolled courses yet.</p>}
            <div className="grid grid-cols-2 gap-4">
              {enrollments.map((enroll) => (
                <div key={enroll.id} className="bg-white p-6 rounded shadow">
                  <h3 className="font-bold mb-3">{enroll.Courses?.title}</h3>
                  <button
                    onClick={() => setSelected(enroll)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
                    Generate Certificate
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setSelected(null)} className="text-blue-600 hover:underline mb-6 block">
              Back to courses
            </button>
            <div ref={certRef} className="bg-white border-8 border-double border-yellow-500 p-12 text-center rounded-xl shadow-2xl">
              <p className="text-yellow-600 text-lg font-semibold mb-2">🌟 Certificate of Completion 🌟</p>
              <p className="text-gray-500 text-sm mb-6">This is to certify that</p>
              <p className="text-4xl font-bold text-blue-700 mb-4">{user?.email?.split('@')[0]}</p>
              <p className="text-gray-500 mb-4">has successfully completed the course</p>
              <p className="text-2xl font-bold text-gray-800 mb-8">{selected?.Courses?.title}</p>
              <div className="border-t border-gray-300 pt-6 mt-6">
                <p className="text-gray-400 text-sm">Issued by LearnHub LMS</p>
                <p className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={printCert}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 w-full text-lg font-semibold">
              Download / Print Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
