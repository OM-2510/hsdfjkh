import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { decisionUrl } from '../api.js'
import { hhmm, mw, ymd } from '../format.js'
import useFetch from '../hooks/useFetch.js'
import Async from './Async.jsx'
import { ControlPanel, CutoffControl, DateControl } from './Controls.jsx'
import { isValidDay } from '../constants.js'

function DecisionView() {
  const [day, setDay] = useState('2026-01-15')
  const [cutoff, setCutoff] = useState('09:20')
  const url = useMemo(() => (isValidDay(day) ? decisionUrl(day, cutoff) : null), [day, cutoff])

  const request = useFetch(url)
  const data = request.data
  const rows = data?.rows ?? []
  const batches = [...new Set(rows.map((row) => row.publishTime))].sort()

  return (
    <div>
      <ControlPanel>
        <DateControl id="delivery-day" label="Delivery day" value={day} onChange={setDay} />
        <CutoffControl value={cutoff} onChange={setCutoff} />
      </ControlPanel>

      {!isValidDay(day) ? (
        <p role="alert" className="mb-5 rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          Choose a delivery day from 2 January to 1 February 2026.
        </p>
      ) : (
        <Async
          status={request.status}
          error={request.error}
          retry={request.retry}
          empty={request.status === 'success' && rows.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              No wind forecast was available for this delivery day before the selected deadline.
            </p>
          ) : null}
        >
          
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Forecast available at decision time</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Delivery day {ymd(data?.delivery_day)} · deadline {hhmm(data?.cutoff_utc)} UTC
                  </p>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">Forecast batch{batches.length === 1 ? '' : 'es'} used: </span>
                  {batches.length ? batches.map(hhmm).join(', ') : '—'}
                </div>
              </div>

              <div className="h-72 w-full sm:h-80" aria-label="Hourly forecast line chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rows} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="startTime"
                      tickFormatter={hhmm}
                      tick={{ fill: 'var(--chart-label)', fontSize: 12 }}
                      minTickGap={24}
                    />
                    <YAxis
                      width={68}
                      tickFormatter={(value) => `${Math.round(value).toLocaleString('en-GB')}`}
                      tick={{ fill: 'var(--chart-label)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--chart-tooltip)', borderColor: 'var(--chart-grid)', color: 'var(--chart-label)' }}
                      labelFormatter={(value) => `Hour starting ${hhmm(value)} UTC`}
                      formatter={(value) => [mw(value), 'Forecast']}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast_mw"
                      name="Forecast"
                      stroke="#047857"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-700">
                <h2 className="font-semibold">Hourly forecast details</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Hours ahead is the time from publication to delivery.</p>
              </div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th scope="col" className="px-4 py-3">Hour (UTC)</th>
                      <th scope="col" className="px-4 py-3">Forecast</th>
                      <th scope="col" className="px-4 py-3">Published (UTC)</th>
                      <th scope="col" className="px-4 py-3">Hours ahead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.map((row) => (
                      <tr key={row.startTime} className="text-slate-800 dark:text-slate-200">
                        <td className="px-4 py-3">{hhmm(row.startTime)}</td>
                        <td className="px-4 py-3 font-medium">{mw(row.forecast_mw)}</td>
                        <td className="px-4 py-3">{hhmm(row.publishTime)}</td>
                        <td className="px-4 py-3">{Number(row.horizon_h).toFixed(1)} h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </Async>
      )}
    </div>
  )
}

export default DecisionView
