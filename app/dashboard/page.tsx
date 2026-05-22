'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [enrolledCount, setEnrolledCount] = useState(0)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id)
        setEnrolledCount(enrollments?.length || 0)

        const { data: coursesData } = await supabase
          .from('Courses')
          .select('*')
          .limit(3)
        setCourses(coursesData || [])
      }
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      fontFamily: 'sans-serif'
    }}>

      {/* TOP BAR */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 800
          }}>LearnHub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            👤 {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600
            }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>

        {/* WELCOME */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          borderRadius: 20,
          padding: 32,
          marginBottom: 28,
          color: 'white'
        }}>
          <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>
            👋 Welcome back,
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {user?.email?.split('@')[0]}!
          </h1>
          <p style={{ opacity: 0.7, fontSize: 15 }}>
            Ready to learn something new today?
          </p>
          <Link href="/courses" style={{
            display: 'inline-block',
            marginTop: 16,
            background: 'white',
            color: '#4f46e5',
            padding: '10px 22px',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 14
          }}>
            Browse Courses →
          </Link>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28
        }}>
          {[
            { icon: '📚', label: 'Enrolled', value: enrolledCount, color: '#6366f1' },
            { icon: '✅', label: 'Completed', value: 0, color: '#10b981' },
            { icon: '🏆', label: 'Certificates', value: 0, color: '#f59e0b' },
            { icon: '⏱️', label: 'Hours', value: 0, color: '#ec4899' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{s.icon}</div>
              <div style={{
                fontSize: 28,
                fontWeight: 800,
                color: s.color
              }}>{s.value}</div>
              <div style={{
                fontSize: 12,
                color: '#94a3b8',
                fontWeight: 600
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* QUICK LINKS */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 16
          }}>Quick Links</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12
          }}>
            {[
              { icon: '📚', label: 'Courses', href: '/courses' },
              { icon: '📝', label: 'Assignments', href: '/assignments' },
              { icon: '🎓', label: 'Certificate', href: '/certificate' },
              { icon: '📊', label: 'Progress', href: '/progress' },
              { icon: '📅', label: 'Calendar', href: '/calendar' },
              { icon: '💬', label: 'Forum', href: '/forum' },
              { icon: '🖥️', label: 'Whiteboard', href: '/whiteboard' },
              { icon: '📈', label: 'Analytics', href: '/analytics' },
            ].map((item, i) => (
              <Link key={i} href={item.href} style={{
                background: 'white',
                borderRadius: 14,
                padding: '16px 12px',
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                display: 'block'
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#374151'
                }}>{item.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* RECENT COURSES */}
        <div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: 16
          }}>Recent Courses</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16
          }}>
            {courses.length === 0 ? (
              <div style={{
                gridColumn: '1/-1',
                background: 'white',
                borderRadius: 16,
                padding: 40,
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                <p style={{ fontWeight: 600 }}>No courses yet</p>
                <Link href="/courses" style={{
                  display: 'inline-block',
                  marginTop: 12,
                  background: '#6366f1',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14
                }}>Browse Courses</Link>
              </div>
            ) : courses.map((course) => (
              <div key={course.id} style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40
                }}>💻</div>
                <div style={{ padding: 16 }}>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>{course.title}</h3>
                  <Link href={`/courses/${course.id}`} style={{
                    display: 'block',
                    background: '#6366f1',
                    color: 'white',
                    padding: '8px',
                    borderRadius: 8,
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 13
                  }}>Continue →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}