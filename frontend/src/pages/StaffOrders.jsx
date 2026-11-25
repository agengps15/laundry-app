import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import {
  formatDate,
  nextStatus,
  pickupLabels,
  rupiah,
  statusLabels,
  statusOrder,
} from '../format'
import StatusBadge from '../StatusBadge'

export default function StaffOrders() {
  const { token } = useAuth()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [loaded, setLoaded] = useState({ key: null, data: null, error: '' })

  const requestKey = `${status}|${page}|${reload}`

  useEffect(() => {
    let ignore = false

    const query = new URLSearchParams({ page })
    if (status) query.set('status', status)

    api(`/orders?${query}`, { token })
      .then((data) => {
        if (!ignore) setLoaded({ key: requestKey, data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setLoaded({ key: requestKey, data: null, error: err.message })
      })

    return () => {
      ignore = true
    }
  }, [token, status, page, requestKey])

  const loading = loaded.key !== requestKey
  const result = loaded.data
  const error = actionError || (loading ? '' : loaded.error)
  const orders = result?.data ?? []

  function changeFilter(value) {
    setStatus(value)
    setPage(1)
  }

  async function advance(order) {
    const next = nextStatus[order.status]
    if (!next) return

    if (
      next === 'completed' &&
      !window.confirm(`Tandai ${order.code} sebagai Selesai? Status tidak bisa diubah lagi.`)
    ) {
      return
    }

    setBusyId(order.id)
    setActionError('')
    try {
      await api(`/orders/${order.id}/advance`, { method: 'PATCH', token })
      setReload((n) => n + 1)
    } catch (err) {
      setActionError(err.errors?.status?.[0] ?? err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Dashboard Order</h1>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {[['', 'Semua'], ...statusOrder.map((s) => [s, statusLabels[s]])].map(([value, label]) => (
          <button
            key={value}
            onClick={() => changeFilter(value)}
            className={`rounded-full border px-3 py-1 ${
              status === value
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && !result && <p className="text-slate-500">Memuat order...</p>}
      {!loading && orders.length === 0 && <p className="text-slate-500">Tidak ada order.</p>}

      <div className="space-y-3">
        {orders.map((order) => {
          const next = nextStatus[order.status]

          return (
            <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{order.code}</h2>
                <StatusBadge status={order.status} />
              </div>

              <p className="mt-1 text-sm text-slate-600">
                {order.customer?.name}
                {order.customer?.phone ? ` · ${order.customer.phone}` : ''}
              </p>
              <p className="text-sm text-slate-500">
                {pickupLabels[order.pickup_type] ?? order.pickup_type}
                {order.address ? ` · ${order.address}` : ''}
              </p>
              <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>

              <ul className="mt-2 text-sm text-slate-700">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.service.name} x {Number(item.quantity)}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-sky-700">{rupiah.format(order.total_price)}</span>
                {next ? (
                  <button
                    onClick={() => advance(order)}
                    disabled={busyId === order.id}
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    {busyId === order.id ? 'Memproses...' : `Ubah ke ${statusLabels[next]}`}
                  </button>
                ) : (
                  <span className="text-sm text-green-700">Selesai</span>
                )}
              </div>
            </article>
          )
        })}
      </div>

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