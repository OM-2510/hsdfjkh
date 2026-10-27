import { MIN_DAY, MAX_DAY } from "../constants"

export function CutoffControl({ value, onChange }) {
  return (
    <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
      Market deadline
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="09:20">09:20 — EPEX</option>
        <option value="09:50">09:50 — N2EX</option>
      </select>
    </label>
  )
}

export function DateControl({ id, label, value, onChange }) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
      {label}
      <input
        id={id}
        type="date"
        min={MIN_DAY}
        max={MAX_DAY}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base shadow-sm focus:border-emerald-700 focus:outline-2 focus:outline-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  )
}

export function ControlPanel({ children }) {
  return <section className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:max-w-3xl dark:border-slate-700 dark:bg-slate-900">{children}</section>
}
