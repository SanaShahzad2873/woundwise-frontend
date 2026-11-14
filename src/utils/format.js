export function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatShortDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatNumber(n) {
  if (n === null || n === undefined) return '-'
  return Number(n).toLocaleString('en-US')
}

export function formatPercent(p) {
  if (p === null || p === undefined) return '-'
  const sign = p > 0 ? '+' : ''
  return `${sign}${p}%`
}