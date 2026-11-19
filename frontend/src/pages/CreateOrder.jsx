import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { rupiah } from '../format'

export default function CreateOrder() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [rows, setRows] = useState([{ service_id: '', quantity: '' }])
  const [pickupType, setPickupType] = useState('walk_in')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState([])

  const isCustomer = user?.role === 'customer'

  useEffect(() => {
    api('/services')
      .then(setServices)
      .catch((err) => setErrors([err.message]))
      .finally(() => setLoading(false))
  }, [])

  const serviceOf = (id) => services.find((s) => String(s.id) === String(id))

  function updateRow(index, field, value) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function subtotalOf(row) {
    const service = serviceOf(row.service_id)
    const qty = parseFloat(row.quantity)
    return service && qty > 0 ? Math.round(qty * service.price) : 0
  }

  const estimate = rows.reduce((sum, row) => sum + subtotalOf(row), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])

    const items = rows
      .filter((r) => r.service_id && parseFloat(r.quantity) > 0)
      .map((r) => ({ service_id: Number(r.service_id), quantity: parseFloat(r.quantity) }))

    if (items.length === 0) {
      setErrors(['Pilih minimal satu layanan dan isi jumlahnya.'])
      return
    }

    setSubmitting(true)
    try {
      const order = await api('/orders', {
        method: 'POST',
        token,
        body: {
          pickup_type: pickupType,
          address: pickupType === 'pickup' ? address : null,
          items,
        },
      })
      navigate('/orders', { state: { created: order.code } })
    } catch (err) {
      const messages = Object.values(err.errors ?? {}).flat()
      setErrors(messages.length ? messages : [err.message])
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-slate-500">Memuat layanan...</p>

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Buat Order</h1>

      {!isCustomer && (
        <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Form ini untuk pelanggan. Form kasir (order atas nama pelanggan) kita buat di tahap dashboard.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {rows.map((row, i) => {
            const service = serviceOf(row.service_id)
            const perItem = service?.pricing_type === 'per_item'

            return (
              <div key={i} className="rounded-md border border-slate-200 p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                  <select
                    value={row.service_id}
                    onChange={(e) => updateRow(i, 'service_id', e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  >
                    <option value="">Pilih layanan</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({rupiah.format(s.price)} / {s.pricing_type === 'per_kg' ? 'kg' : 'item'})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={perItem ? 1 : 0.1}
                    step={perItem ? 1 : 0.1}
                    placeholder={perItem ? 'Jumlah' : 'Berat (kg)'}
                    value={row.quantity}
                    onChange={(e) => updateRow(i, 'quantity', e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal: {rupiah.format(subtotalOf(row))}</span>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { service_id: '', quantity: '' }])}
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            + Tambah layanan
          </button>
        </div>

        <fieldset className="space-y-2 text-sm">
          <legend className="mb-1 font-medium">Cara pengambilan</legend>
          <label className="mr-4 inline-flex items-center gap-2">
            <input type="radio" checked={pickupType === 'walk_in'} onChange={() => setPickupType('walk_in')} />
            Antar sendiri ke toko
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" checked={pickupType === 'pickup'} onChange={() => setPickupType('pickup')} />
            Dijemput kurir
          </label>
        </fieldset>

        {pickupType === 'pickup' && (
          <label className="block text-sm">
            Alamat penjemputan
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            <p className="text-sm text-slate-500">Estimasi total</p>
            <p className="text-xl font-bold text-sky-700">{rupiah.format(estimate)}</p>
          </div>
          <button
            type="submit"
            disabled={submitting || !isCustomer}
            className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? 'Memproses...' : 'Kirim Order'}
          </button>
        </div>

        {errors.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-600">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </form>

      <p className="mt-3 text-xs text-slate-500">
        Total di atas hanya perkiraan. Harga final dihitung oleh server saat order dibuat.
      </p>
    </section>
  )
}