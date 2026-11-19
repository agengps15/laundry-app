const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const error = new Error(data?.message ?? 'Terjadi kesalahan')
    error.status = res.status
    error.errors = data?.errors ?? {}
    throw error
  }

  return data
}