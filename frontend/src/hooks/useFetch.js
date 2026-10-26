import { useCallback, useEffect, useState } from 'react'

async function readError(response) {
  try {
    const body = await response.json()
    if (typeof body?.detail === 'string') return body.detail
    if (body?.detail !== undefined) return JSON.stringify(body.detail)
  } catch {
    // A non-JSON error still gets a useful HTTP status below.
  }
  return `Request failed (${response.status})`
}

function useFetch(url) {
  const [result, setResult] = useState({ status: url ? 'loading' : 'success', data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    if (!url) {
      setResult({ status: 'success', data: null, error: null })
      return undefined
    }

    const controller = new AbortController()
    setResult({ status: 'loading', data: null, error: null })

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(await readError(response))
        }
        const data = await response.json()
        setResult({ status: 'success', data, error: null })
      } catch (error) {
        if (error.name === 'AbortError') return
        setResult({ status: 'error', data: null, error: error.message || 'Unable to load data' })
      }
    }

    load()
    return () => controller.abort()
  }, [url, attempt])

  return { ...result, retry }
}

export default useFetch

