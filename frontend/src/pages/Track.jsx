import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { formatDate, statusLabels, statusOrder } from '../format'
import StatusBadge from '../StatusBadge'

export default function Track() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(code ?? '')
  const [loaded, setLoaded] = useState({ code: null, data: null, error: '' })

  useEffect(() => {
    if (!code) return
    let ignore = false

    api(`/track/${encodeURIComponent(code)}`)
      .then((d) => {
        if (!ignore) setLoaded({ code, data: d, error: '' })
      })
      .catch((err) => {
        if (ignore) return
        let message = err.message
        if (err.status === 404) message = 'Kode order tidak ditemukan. Periksa kembali kodenya.'
        else if (err.status === 429) message = 'Terlalu banyak permintaan. Coba lagi sebentar lagi.'
        setLoaded({ code, data: null, error: message })
      })

    return () => {
      ignore = true
    }
  }, [code])

  const current = loaded.code === code ? loaded : null
  const loading = Boolean(code) && !current
  const data = current?.data ?? null
  const error = current?.error ?? ''

  function handleSubmit(e) {
    e.preventDefault()
    const value = input.trim().toUpperCase()
    if (value) navigate(`/track/${value}`)
  }

  const currentIndex = data ? statusOrder.indexOf(data.status) : -1

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Lacak Order</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Contoh: LDR-261112-QVYB"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700">
          Cari
        </button>
      </form>

      {loading && <p className="text-slate-500">Mencari order...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{data.code}</h2>
            <StatusBadge status={data.status} />
          </div>

          <ol className="flex items-start justify-between text-center text-xs">
            {statusOrder.map((step, i) => (
              <li key={step} className="flex-1">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white ${
                    i <= currentIndex ? 'bg-sky-600' : 'bg-slate-300'
                  }`}
                >
                  {i + 1}
                </div>
                <p className={`mt-1 ${i <= currentIndex ? 'font-medium text-slate-900' : 'text-slate-400'}`}>
                  {statusLabels[step]}
                </p>
              </li>
            ))}
          </ol>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Riwayat status</h3>
            <ul className="space-y-1 text-sm">
              {data.timeline.map((entry, i) => (
                <li key={i} className="flex justify-between">
                  <span>{entry.label}</span>
                  <span className="text-slate-500">{formatDate(entry.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}