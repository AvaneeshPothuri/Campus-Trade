import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Input from './UI/Input'
import Button from './UI/Button'
import Card from './UI/Card'

export default function Login({ setPage, setUser }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill all fields')
      return
    }

    const { data: userRecord, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (userRecord) {
      setError('')
      setUser(username)
      setPage('profile')   // <--- Redirect to profile after successful login
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <Card className="w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Login</h2>
        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <Button color="green" onClick={handleLogin}>Login</Button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <button onClick={() => setPage('signup')} className="text-green-500 underline hover:text-green-700 transition">
            Signup
          </button>
        </p>
      </Card>
    </div>
  )
}
