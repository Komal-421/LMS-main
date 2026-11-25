export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value.slice(0, 10) : '';
  }
  return date.toISOString().slice(0, 10);
}

export function capitalize(value) {
  if (!value) return '';
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export function getStatusBadgeClasses(status) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    case 'inactive':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    case 'passed out':
      return 'bg-sky-50 text-sky-700 ring-sky-600/20';
    case 'dropped':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-600/20';
  }
}
