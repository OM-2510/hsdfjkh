import { useEffect, useState } from 'react'

function Async({ status, error, retry, children, skeleton = 'chart', empty = null }) {
  const [waitingLong, setWaitingLong] = useState(false)

  useEffect(() => {
    if (status !== 'loading') {
      setWaitingLong(false)
      return undefined
    }
    const timer = window.setTimeout(() => setWaitingLong(true), 3000)
    return () => window.clearTimeout(timer)
  }, [status])

  if (status === 'loading') {
    return (
      <div aria-live="polite" className="space-y-4">
        <div
          aria-label="Loading data"
          className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${
            skeleton === 'table' ? 'h-48' : 'h-72 sm:h-80'
          }`}
        />
        {waitingLong && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Still working. The server may be waking up, so the first load can take up to 30 seconds.
          </p>
        )}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
        <p className="font-semibold">Data could not be loaded</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-md bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus:outline-2 focus:outline-offset-2 focus:outline-red-900"
        >
          Retry
        </button>
      </div>
    )
  }

  return empty || children
}

export default Async
