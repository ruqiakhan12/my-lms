'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
      setPosts(data || [])
    }
    getData()
  }, [])

  const post = async () => {
    if (!message) return
    if (!user) { setSuccess('Please login first!'); return }
    const { error } = await supabase.from('forum_posts').insert({
      user_id: user.id,
      message
    })
    if (error) { setSuccess('Error posting!'); return }
    setSuccess('Posted successfully!')
    setMessage('')
    const { data } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">💬 Discussion Forum</h1>
        {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</p>}
        <div className="bg-white p-6 rounded shadow mb-6">
          <textarea
            className="w-full border rounded p-3 h-24 mb-3"
            placeholder="Write your question or message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button onClick={post} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
            Post Message
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {posts.length === 0 && <p className="text-gray-400 text-center py-8">No posts yet. Be the first to post!</p>}
          {posts.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded shadow">
              <p className="text-gray-800 mb-2">{p.message}</p>
              <p className="text-gray-400 text-xs">{new Date(p.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
