'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TeacherPortfolio() {
  const [courses, setCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrollCount, setEnrollCount] = useState(0)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: coursesData } = await supabase.from('Courses').select('*')
      setCourses(coursesData || [])
      const { data: enrollData } = await supabase.from('enrollments').select('id')
      setEnrollCount(enrollData?.length || 0)
    }
    getData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-10 rounded-3xl p-10 text-white text-center mb-8">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            👨‍🏫
          </div>
          <h1 className="text-4xl font-extrabold mb-2">{user?.email?.split('@')[0]}</h1>
          <p className="text-blue-200 text-lg mb-4">Professional Educator at LearnHub</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">⭐ Expert Teacher</span>
            <span className="bg-green-400 text-green-900 px-4 py-1 rounded-full text-sm font-bold">✅ Verified</span>
            <span className="bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">🏆 Top Rated</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white bg-opacity-10 rounded-2xl p-6 text-center text-white">
            <p className="text-4xl font-bold text-yellow-400">{courses.length}</p>
            <p className="font-semibold">Courses</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-2xl p-6 text-center text-white">
            <p className="text-4xl font-bold text-yellow-400">{enrollCount}</p>
            <p className="font-semibold">Students</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-2xl p-6 text-center text-white">
            <p className="text-4xl font-bold text-yellow-400">⭐ 5.0</p>
            <p className="font-semibold">Rating</p>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-3">About Me</h2>
          <p className="text-blue-100 leading-relaxed">
            Passionate educator with years of experience in online teaching. 
            Specialized in research methods, data analysis, and professional development. 
            Committed to helping students achieve their learning goals through engaging and practical courses.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 transform hover:scale-105 transition-all shadow-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl h-24 mb-4 flex items-center justify-center text-3xl">
                📚
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{course.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-extrabold">${course.price || '0'}</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">✅ Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
