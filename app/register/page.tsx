'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created! Please check your email to confirm.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">Create Account</h2>
        {message && <p className="text-center text-green-600 mb-4">{message}</p>}
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="border border-gray-300 rounded px-4 py-3 w-full"/>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-300 rounded px-4 py-3 w-full"/>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border border-gray-300 rounded px-4 py-3 w-full"/>
          <button onClick={handleRegister} className="bg-purple-700 text-white py-3 rounded font-bold text-lg">Sign Up</button>
        </div>
        <p className="text-center mt-4 text-gray-500">Already have an account? <a href="/login" className="text-purple-700 font-bold">Login</a></p>
      </div>
    </main>
  )
}