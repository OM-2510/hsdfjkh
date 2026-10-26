import { useEffect, useState } from 'react'
import DecisionView from './components/DecisionView.jsx'
import AccuracyView from './components/AccuracyView.jsx'

const tabs = [
  { id: 'decision', label: 'Decision View' },
  { id: 'accuracy', label: 'Forecast Accuracy' },
]

function App() {
  const [activeTab, setActiveTab] = useState('decision')
  const [isDark, setIsDark] = useState(() => window.localStorage.getItem('wind-forecast-theme') === 'dark')

  useEffect(() => {
    window.localStorage.setItem('wind-forecast-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <main className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${isDark ? 'dark' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
              GB day-ahead electricity
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">National wind forecasts</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              See the wind forecast available before the market deadline, and how those forecasts compare to the actual output.
            </p>
          </div>
          <label className="flex self-start items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="relative inline-flex">
              <input
                type="checkbox"
                role="switch"
                aria-label="Dark mode"
                checked={isDark}
                onChange={(event) => setIsDark(event.target.checked)}
                className="peer sr-only"
              />
              <span className="flex h-10 w-[4.5rem] cursor-pointer items-center rounded-full bg-amber-100 p-1 transition-colors peer-checked:bg-slate-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow transition-transform ${isDark ? 'translate-x-8 bg-slate-950 text-indigo-200' : 'translate-x-0 bg-white text-amber-500'}`}>
                  {isDark ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.6 8.6 0 1 0 20.2 15.5Z" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                    </svg>
                  )}
                </span>
              </span>
            </span>
          </label>
        </header>

        <nav aria-label="Forecast views" className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-3 text-m font-bold tracking-tight ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-900 dark:border-emerald-400 dark:text-emerald-300'
                  : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'decision' ? <DecisionView /> : <AccuracyView />}
      </div>
    </main>
  )
}

export default App
