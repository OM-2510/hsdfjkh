import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { mw } from '../format.js'

const breakdowns = [
  { key: 'by_hour', label: 'Hour of day', category: 'hour' },
  { key: 'by_horizon', label: 'Hours ahead', category: 'horizon' },
  { key: 'by_wind_level', label: 'Wind level', category: 'level' },
]

function BreakdownChart({ data }) {
  const [selected, setSelected] = useState('by_hour')
  const current = breakdowns.find((item) => item.key === selected)
  const rows = data?.[selected] ?? []
  const chartRows = rows.map((row) => ({
    ...row,
    categoryLabel: current.key === 'by_hour' ? `${String(row.hour).padStart(2, '0')}:00` : row[current.category],
  }))

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Where forecast errors vary</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Compare the typical miss with the 90th-percentile miss.</p>
        </div>
        <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Group results by
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {breakdowns.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartRows} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
            <XAxis dataKey="categoryLabel" tick={{ fill: 'var(--chart-label)', fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis width={68} tick={{ fill: 'var(--chart-label)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--chart-tooltip)', borderColor: 'var(--chart-grid)', color: 'var(--chart-label)' }}
              formatter={(value) => mw(value)}
            />
            <Legend />
            <Bar dataKey="mae_mw" name="Typical miss (MAE)" fill="#047857" />
            <Bar dataKey="p90_abs_error_mw" name="90% of misses are below" fill="#b45309" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default BreakdownChart
