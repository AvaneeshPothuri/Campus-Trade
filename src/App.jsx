import { useState } from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import BuySell from './components/BuySell'
import Auctions from './components/Auctions'
import Profile from './components/Profile'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
    setPage('login')
  }

  if (!user) {
    return page === 'login' ? <Login setPage={setPage} setUser={setUser} /> : <Signup setPage={setPage} />
  }

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      
      {/* Sticky Navbar with Left Navigation & Right Logout */}
      <nav className="sticky top-0 z-50 flex justify-between items-center mb-6 bg-white p-4 rounded-b-xl shadow-lg backdrop-blur-md bg-opacity-90">
        
        {/* Left Navigation */}
        <div className="flex gap-6">
          <button
            onClick={() => setPage('buy')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              page === 'buy' ? 'bg-blue-500 text-white' : 'text-blue-500 hover:bg-blue-100'
            }`}
          >
            Buy/Sell
          </button>

          <button
            onClick={() => setPage('auction')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              page === 'auction' ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-100'
            }`}
          >
            Auctions
          </button>

          <button
            onClick={() => setPage('profile')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              page === 'profile' ? 'bg-purple-500 text-white' : 'text-purple-600 hover:bg-purple-100'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Right Side: Logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg font-semibold text-red-500 hover:bg-red-100 transition"
        >
          Logout
        </button>
      </nav>

      {/* Pages */}
      {page === 'buy' && <BuySell user={user} />}
      {page === 'auction' && <Auctions user={user} />}
      {page === 'profile' && <Profile user={user} />}
    </div>
  )
}

export default App
