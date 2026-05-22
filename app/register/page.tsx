'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setError('')
    if (!fullName || !email || !password) {
      setError('Please fill in all fields!')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters!')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role }
        }
      })
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'sans-serif', padding: 20
      }}>
        <div style={{
          background: 'white', borderRadius: 24, padding: '48px 40px',
          textAlign: 'center', maxWidth: 440, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
            Welcome to LearnHub!
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Your account has been created successfully!
            Please check your email to verify your account.
          </p>
          <Link href="/login" style={{
            display: 'block', padding: '14px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', borderRadius: 12, textDecoration: 'none',
            fontWeight: 700, fontSize: 15
          }}>
            Go to Login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: 'sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>

      {/* LEFT SIDE — decorative */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 40, color: 'white',
        display: 'none' as any
      }} className="hide-mobile">
      </div>

      {/* RIGHT SIDE — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20, minHeight: '100vh'
      }}>
        <div style={{
          background: 'white', borderRadius: 24,
          padding: '40px 36px', width: '100%', maxWidth: 460,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>

          {/* Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28
            }}>🎓</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
              Create Account
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              Join LearnHub and start learning today!
            </p>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>
              I am joining as:
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setRole('student')}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                  border: role === 'student' ? '2px solid #667eea' : '2px solid #e2e8f0',
                  background: role === 'student' ? 'linear-gradient(135deg, #ede9fe, #e0e7ff)' : 'white',
                  color: role === 'student' ? '#667eea' : '#94a3b8',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
                }}>
                👨‍🎓 Student
              </button>
              <button
                onClick={() => setRole('teacher')}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                  border: role === 'teacher' ? '2px solid #667eea' : '2px solid #e2e8f0',
                  background: role === 'teacher' ? 'linear-gradient(135deg, #ede9fe, #e0e7ff)' : 'white',
                  color: role === 'teacher' ? '#667eea' : '#94a3b8',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
                }}>
                👩‍🏫 Teacher
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', fontSize: 16
              }}>👤</span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: 12, border: '2px solid #e2e8f0',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border 0.2s', color: '#1e293b'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', fontSize: 16
              }}>✉️</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: 12, border: '2px solid #e2e8f0',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border 0.2s', color: '#1e293b'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)', fontSize: 16
              }}>🔒</span>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: 12, border: '2px solid #e2e8f0',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border 0.2s', color: '#1e293b'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '12px 16px',
              color: '#dc2626', fontSize: 13, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ❌ {error}
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              transition: 'all 0.2s', marginBottom: 20
            }}>
            {loading ? '⏳ Creating Account...' : '🚀 Create My Account'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Login Link */}
          <Link href="/login" style={{
            display: 'block', textAlign: 'center',
            padding: '13px', borderRadius: 12,
            border: '2px solid #e2e8f0', color: '#667eea',
            textDecoration: 'none', fontWeight: 700, fontSize: 14,
            transition: 'all 0.2s'
          }}>
            Sign In Instead →
          </Link>
        </div>
      </div>
    </div>
  )
}