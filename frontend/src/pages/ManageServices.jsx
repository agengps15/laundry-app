import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth'
import { rupiah } from '../format'

const emptyForm = { name: '', pricing_type: 'per_kg', price: '', estimated_hours: 24 }

export default function ManageServices() {
  const { token } = useAuth()
  const [services, setServices] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let ignore = false

    api('/admin/services', { token })
      .then((data) => {
        if (!ignore) setServices(data)
      })
      .catch((err) => {
        if (!ignore) setErrors([err.message])
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [token, reload])

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function startEdit(service) {
    setEditingId(service.id)
    setForm({
      name: service.name,
      pricing_type: service.pricing_type,
      price: service.price,
      estimated_hours: service.estimated_hours,
    })
    setErrors([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
  }

  function toMessages(err) {
    const messages = Object.values(err.errors ?? {}).flat()
    return messages.length ? messages : [err.message]
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors([])
    setSaving(true)

    const body = {
      name: form.name.trim(),
      pricing_type: form.pricing_type,
      price: Number(form.price),
      estimated_hours: Number(form.estimated_hours),
    }

    try {
      if (editingId) {
        await api(`/services/${editingId}`, { method: 'PUT', token, body })
      } else {
        await api('/services', { method: 'POST', token, body })
      }
      cancelEdit()
      setReload((n) => n + 1)
    } catch (err) {
      setErrors(toMessages(err))
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(service) {
    setErrors([])
    try {
      await api(`/services/${service.id}`, {
        method: 'PUT',
        token,
        body: {
          name: service.name,
          pricing_type: service.pricing_type,
          price: service.price,
          estimated_hours: service.estimated_hours,
          is_active: !service.is_active,
        },
      })
      setReload((n) => n + 1)
    } catch (err) {
      setErrors(toMessages(err))
    }
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Kelola Layanan</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="font-semibold">{editingId ? 'Ubah Layanan' : 'Tambah Layanan'}</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Nama
            <input
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Jenis harga
            <select
              value={form.pricing_type}
              onChange={(e) => setField('pricing_type', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="per_kg">Per kg</option>
              <option value="per_item">Per item</option>
            </select>
          </label>
          <label className="block text-sm">
            Harga (Rp)
            <input
              required
              type="number"
              min="0"
              step="500"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Estimasi (jam)
            <input
              required
              type="number"
              min="1"
              value={form.estimated_hours}
              onChange={(e) => setField('estimated_hours', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        {errors.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-600">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-slate-500">Memuat layanan...</p>}

      <div className="space-y-3">
        {services.map((s) => (
          <article
            key={s.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4 shadow-sm ${
              s.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'
            }`}
          >
            <div>
              <h2 className="font-semibold">
                {s.name}
                {!s.is_active && (
                  <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-normal">
                    Nonaktif
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-600">
                {rupiah.format(s.price)} / {s.pricing_type === 'per_kg' ? 'kg' : 'item'} · estimasi{' '}
                {s.estimated_hours} jam
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => startEdit(s)}
                className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
              >
                Ubah
              </button>
              <button
                onClick={() => toggleActive(s)}
                className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
              >
                {s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}