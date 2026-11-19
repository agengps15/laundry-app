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

export function formatDate(value) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}