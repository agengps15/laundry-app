import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import ProtectedRoute from './ProtectedRoute'
import CreateOrder from './pages/CreateOrder'
import Login from './pages/Login'
import ManageServices from './pages/ManageServices'
import MyOrders from './pages/MyOrders'
import Services from './pages/Services'
import StaffOrders from './pages/StaffOrders'
import Track from './pages/Track'

function Navbar() {
  const { user, logout } = useAuth()
  const isStaff = ['admin', 'cashier'].includes(user?.role)
  const isAdmin = user?.role === 'admin'

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className="text-lg font-bold text-sky-700">
            Laundry App
          </Link>
          <Link to="/track" className="text-sm text-slate-600 hover:text-sky-700">
            Lacak
          </Link>
          {user && (
            <>
              <Link to="/orders" className="text-sm text-slate-600 hover:text-sky-700">
                Pesanan Saya
              </Link>
              <Link to="/orders/new" className="text-sm text-slate-600 hover:text-sky-700">
                Buat Order
              </Link>
            </>
          )}
          {isStaff && (
            <Link to="/staff/orders" className="text-sm text-slate-600 hover:text-sky-700">
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/services" className="text-sm text-slate-600 hover:text-sky-700">
              Kelola Layanan
            </Link>
          )}
        </div>
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
            <Link to="/login" className="rounded-md bg-sky-600 px-3 py-1 text-white hover:bg-sky-700">
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
          <Route path="/track" element={<Track />} />
          <Route path="/track/:code" element={<Track />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <CreateOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/orders"
            element={
              <ProtectedRoute roles={['admin', 'cashier']}>
                <StaffOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageServices />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}