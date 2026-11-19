import { statusLabels } from './format'

const colors = {
  received: 'bg-slate-100 text-slate-700',
  washing: 'bg-sky-100 text-sky-700',
  ironing: 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-green-100 text-green-800',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.received}`}>
      {statusLabels[status] ?? status}
    </span>
  )
}