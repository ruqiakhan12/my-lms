'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: coursesData } = await supabase
        .from('Courses')
        .select('*')
      setCourses(coursesData || [])

      if (user) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id)
        setEnrolledCourses(
          enrollments?.map((e) => e.course_id) || []
        )
      }
    }
    getData()
  }, [])

  const enroll = async (courseId: string, checkoutUrl: string) => {
    // Step 1 — Login check
    if (!user) {
      localStorage.setItem('pendingCheckout', checkoutUrl)
      router.push('/login')
      return
    }

    // Step 2 — Already enrolled check
    if (enrolledCourses.includes(courseId)) {
      setMessage('You are already enrolled!')
      return
    }

    // Step 3 — Lemon Squeezy payment kholо
    localStorage.setItem('pendingCourseId', courseId)

    // Lemon Squeezy script load karo
    if (window.LemonSqueezy) {
      window.LemonSqueezy.Url.Open(checkoutUrl)
    } else {
      window.open(checkoutUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          📚 Available Courses
        </h1>

        {message && (
          <p className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {message}
          </p>
        )}

        <div className="grid grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded shadow"
            >
              <h2 className="text-xl font-bold mb-2">
                {course.title}
              </h2>
              <p className="text-gray-500 mb-4">
                {course.description}
              </p>

              {enrolledCourses.includes(course.id) ? (
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed w-full"
                  disabled
                >
                  ✅ Enrolled
                </button>
              ) : (
                <button
                  onClick={() =>
                    enroll(
                      course.id,
                      course.checkout_url ||
                      'https://learnhub.lemonsqueezy.com/checkout/buy/YOUR-ID'
                    )
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-bold"
                >
                  🎓 Enroll Now
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}