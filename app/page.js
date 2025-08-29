'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      // User doc will be created by AuthProvider
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Agent Ascend
          </h1>
          <p className="text-gray-300 text-sm mt-2">Performance Gamification Platform</p>
        </div>

        <form onSubmit={isCreating ? handleCreate : handleLogin} className="space-y-4">
          {isCreating && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            {isCreating ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full mt-4 bg-white/10 backdrop-blur text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition border border-white/20"
        >
          {isCreating ? 'Back to Login' : 'Create Account'}
        </button>
        
        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  )
}