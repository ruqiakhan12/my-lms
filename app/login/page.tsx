'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const login = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // PAYMENT FIX — login ke baad checkout check karo
    const pendingCheckout = localStorage.getItem('pendingCheckout')
    if (pendingCheckout) {
      localStorage.removeItem('pendingCheckout')
      window.location.href = pendingCheckout
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="relative z-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white border-opacity-20">
        
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🎓</p>
          <h1 className="text-3xl font-extrabold text-white">Welcome Back!</h1>
          <p className="text-blue-200 mt-2">Login to your LearnHub account</p>
        </div>

        {error && (
          <p className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-xl mb-4 text-center text-sm">
            ❌ {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Email</label>
          <input
            type="email"
            className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-blue-300 outline-none focus:border-yellow-400 transition"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">Password</label>
          <input
            type="password"
            className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-3 text-white placeholder-blue-300 outline-none focus:border-yellow-400 transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-yellow-400 text-blue-900 py-3 rounded-xl font-bold text-lg hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? '⏳ Logging in...' : '🚀 Login'}
        </button>

        <p className="text-center text-blue-200 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-yellow-400 font-bold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  )
}