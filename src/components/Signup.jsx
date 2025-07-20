import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Button from './UI/Button'
import Card from './UI/Card'
import Input from './UI/Input'

export default function Signup({ setPage }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [facebook, setFacebook] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    if (!phone && !facebook) {
      setError('Please provide at least a phone number or Facebook username')
      return
    }

    if (phone && (!/^\d{10}$/.test(phone))) {
      setError('Phone number must be exactly 10 digits')
      return
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (existingUser) {
      setError('Username already taken')
      return
    }

    await supabase.from('users').insert([{
      username,
      password,
      phone_number: phone || null,
      facebook_username: facebook || null
    }])

    alert('Signup successful! Please login.')
    setPage('login')
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-100 to-blue-100">
      <Card>
        <h2 className="text-3xl font-bold mb-4 text-center text-indigo-600">Create Account</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Input placeholder="Phone Number (optional)" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input placeholder="Facebook Username (optional)" value={facebook} onChange={e => setFacebook(e.target.value)} />
        <Button color="green" onClick={handleSignup}>Sign Up</Button>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <span onClick={() => setPage('login')} className="text-indigo-500 cursor-pointer underline">
            Login
          </span>
        </p>
      </Card>
    </div>
  )
}
