const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function apiUrl(path, params) {
  const query = new URLSearchParams(params)
  return `${apiBase}/api/${path}?${query.toString()}`
}

export function decisionUrl(day, cutoff) {
  return apiUrl('decision', { day, cutoff })
}

export function compareUrl(start, end, cutoff) {
  return apiUrl('compare', { start, end, cutoff })
}

export function metricsUrl(start, end, cutoff) {
  return apiUrl('metrics', { start, end, cutoff })
}
