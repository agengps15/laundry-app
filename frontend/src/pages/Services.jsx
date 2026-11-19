import { useEffect, useState } from 'react'
import { api } from '../api'

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/services')
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-slate-500">Memuat layanan...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (services.length === 0) return <p className="text-slate-500">Belum ada layanan.</p>

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Layanan Kami</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article key={s.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="mt-1 text-xl font-bold text-sky-700">
              {rupiah.format(s.price)}
              <span className="text-sm font-normal text-slate-500">
                {s.pricing_type === 'per_kg' ? ' / kg' : ' / item'}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-500">Estimasi {s.estimated_hours} jam</p>
          </article>
        ))}
      </div>
    </section>
  )
}