import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Login from './pages/Login'
import Services from './pages/Services'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link to="/" className="text-lg font-bold text-sky-700">
          Laundry App
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-slate-600">Halo, {user.name}</span>
              <button
                onClick={logout}
                className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-sky-600 px-3 py-1 text-white hover:bg-sky-700"
            >
              Masuk
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl p-4">
        <Routes>
          <Route path="/" element={<Services />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}