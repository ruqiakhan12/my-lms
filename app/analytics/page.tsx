'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
  })

  useEffect(() => {
    const getData = async () => {
      const { data: courses } = await supabase.from('Courses').select('id')
      const { data: enrollments } = await supabase.from('enrollments').select('id, student_id')
      const { data: assignments } = await supabase.from('assignments').select('id')
      const { data: grades } = await supabase.from('grades').select('id')
      const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || [])
      setStats({
        totalCourses: courses?.length || 0,
        totalStudents: uniqueStudents.size,
        totalEnrollments: enrollments?.length || 0,
        totalAssignments: assignments?.length || 0,
        totalSubmissions: grades?.length || 0,
      })
    }
    getData()
  }, [])

  const cards = [
    { label: 'Total Courses', value: stats.totalCourses, color: 'bg-blue-500', icon: '📚' },
    { label: 'Total Students', value: stats.totalStudents, color: 'bg-green-500', icon: '👨‍🎓' },
    { label: 'Total Enrollments', value: stats.totalEnrollments, color: 'bg-purple-500', icon: '📋' },
    { label: 'Total Assignments', value: stats.totalAssignments, color: 'bg-yellow-500', icon: '📝' },
    { label: 'Submissions', value: stats.totalSubmissions, color: 'bg-red-500', icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-500 mb-8">Overview of your LearnHub platform</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <div key={card.label} className={`${card.color} text-white p-6 rounded-xl shadow`}>
              <p className="text-4xl mb-2">{card.icon}</p>
              <p className="text-4xl font-bold">{card.value}</p>
              <p className="text-sm opacity-90 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Platform Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Assignment completion rate</span>
              <span className="font-bold text-green-600">
                {stats.totalAssignments > 0 ? Math.round((stats.totalSubmissions / stats.totalAssignments) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Average enrollments per course</span>
              <span className="font-bold text-blue-600">
                {stats.totalCourses > 0 ? Math.round(stats.totalEnrollments / stats.totalCourses) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total active users</span>
              <span className="font-bold text-purple-600">{stats.totalStudents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
