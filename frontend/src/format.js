export const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const statusLabels = {
  received: 'Diterima',
  washing: 'Dicuci',
  ironing: 'Disetrika',
  ready: 'Siap diambil/diantar',
  completed: 'Selesai',
}

export const statusOrder = ['received', 'washing', 'ironing', 'ready', 'completed']

export const nextStatus = {
  received: 'washing',
  washing: 'ironing',
  ironing: 'ready',
  ready: 'completed',
}

export const pickupLabels = {
  walk_in: 'Antar sendiri ke toko',
  pickup: 'Dijemput kurir',
}

export function formatDate(value) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}