import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { formatDate, rupiah } from '../format'
import StatusBadge from '../StatusBadge'

export default function MyOrders() {
  const { token } = useAuth()
  const location = useLocation()
  const createdCode = location.state?.created
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/orders?page=${page}`, { token })
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, token])

  if (loading) return <p className="text-slate-500">Memuat pesanan...</p>
  if (error) return <p className="text-red-600">{error}</p>

  const orders = result?.data ?? []

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
        <Link to="/orders/new" className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700">
          Buat Order
        </Link>
      </div>

      {createdCode && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Order berhasil dibuat. Kode order kamu: <strong>{createdCode}</strong>
        </p>
      )}

      {orders.length === 0 ? (
        <p className="text-slate-500">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{order.code}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatDate(order.created_at)}</p>
              <ul className="mt-2 text-sm text-slate-700">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.service.name} x {Number(item.quantity)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-sky-700">{rupiah.format(order.total_price)}</span>
                <Link to={`/track/${order.code}`} className="text-sm text-sky-700 hover:underline">
                  Lacak
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {result && result.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-slate-500">
            Halaman {result.current_page} dari {result.last_page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= result.last_page}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      )}
    </section>
  )
}