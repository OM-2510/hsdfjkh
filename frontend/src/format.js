const numberFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const decimalFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 })

export function hhmm(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}

export function ymd(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toISOString().slice(0, 10)
}

export function mw(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return `${(digits ? decimalFormat : numberFormat).format(value)} MW`
}

export function number(value, digits = 1) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: digits }).format(value)
}
