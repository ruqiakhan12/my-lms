'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const getCourses = async () => {
      const { data } = await supabase.from('Courses').select('*').limit(4)
      setCourses(data || [])
    }
    getCourses()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>
        <div className={`relative z-10 text-center py-32 px-4 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
            Learn Anything,<br/>
            <span className="text-yellow-400">Teach Everything</span>
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Pakistan's most powerful online learning platform. Join thousands of students and teachers today!
          </p>
          <Link href="/courses">
            <button className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-full font-bold text-xl hover:bg-yellow-300 transform hover:scale-105 transition-all shadow-lg">
              🚀 Browse Courses
            </button>
          </Link>
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: '👨‍🎓', label: 'Students', value: '1000+' },
              { icon: '📚', label: 'Courses', value: '50+' },
              { icon: '👨‍🏫', label: 'Teachers', value: '20+' },
              { icon: '🏆', label: 'Certificates', value: '500+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white bg-opacity-20 rounded-2xl p-6 text-center transform hover:scale-105 transition-all">
                <p className="text-4xl mb-2">{stat.icon}</p>
                <p className="text-3xl font-bold text-yellow-400">{stat.value}</p>
                <p className="text-white font-semibold text-lg">{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-8">⭐ Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white bg-opacity-10 rounded-2xl p-6 text-white transform hover:scale-105 transition-all hover:bg-opacity-20">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl h-32 mb-4 flex items-center justify-center text-4xl">
                  📚
                </div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-blue-200 text-sm mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400 font-bold text-lg">${course.price || '0'}</span>
                  <Link href="/courses">
                    <button className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition-all">
                      Enroll Now →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto bg-white bg-opacity-10 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start? 🚀</h2>
          <p className="text-blue-200 mb-8">Join LearnHub today and start your learning journey!</p>
          <Link href="/register">
            <button className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-full font-bold text-xl hover:bg-yellow-300 transform hover:scale-105 transition-all shadow-xl">
              Get Started Free ✨
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
