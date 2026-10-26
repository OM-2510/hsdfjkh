import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { compareUrl, metricsUrl } from '../api.js'
import { hhmm, mw, ymd } from '../format.js'
import useFetch from '../hooks/useFetch.js'
import Async from './Async.jsx'
import { ControlPanel, CutoffControl, DateControl, isValidDay } from './Controls.jsx'
import MetricCards from './MetricCards.jsx'
import BreakdownChart from './BreakdownChart.jsx'

function AccuracyView() {
  const [start, setStart] = useState('2026-01-02')
  const [end, setEnd] = useState('2026-01-31')
  const [cutoff, setCutoff] = useState('09:20')
  const validRange = isValidDay(start) && isValidDay(end) && start <= end
  const compareRequestUrl = useMemo(
    () => (validRange ? compareUrl(start, end, cutoff) : null),
    [start, end, cutoff, validRange],
  )
  const metricRequestUrl = useMemo(
    () => (validRange ? metricsUrl(start, end, cutoff) : null),
    [start, end, cutoff, validRange],
  )
  const compareRequest = useFetch(compareRequestUrl)
  const metricsRequest = useFetch(metricRequestUrl)
  const rows = compareRequest.data?.rows ?? []

  return (
    <div>
      <ControlPanel>
        <DateControl id="range-start" label="From date" value={start} onChange={setStart} />
        <DateControl id="range-end" label="To date" value={end} onChange={setEnd} />
        <CutoffControl value={cutoff} onChange={setCutoff} />
      </ControlPanel>

      {start > end ? (
        <p role="alert" className="mb-5 rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          The from date must be on or before the to date. No data has been requested.
        </p>
      ) : !isValidDay(start) || !isValidDay(end) ? (
        <p role="alert" className="mb-5 rounded-lg bg-amber-50 p-4 text-sm font-medium text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          Choose dates from 2 January to 1 February 2026.
        </p>
      ) : (
        <div className="space-y-6">
          <Async
            status={compareRequest.status}
            error={compareRequest.error}
            retry={compareRequest.retry}
            empty={compareRequest.status === 'success' && rows.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                No matching forecast and actual wind hours were found for this period.
              </p>
            ) : null}
          >
            <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Forecast compared with actual wind</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {ymd(start)} to {ymd(end)} · hourly output in MW
                </p>
              </div>
              <div className="h-72 w-full sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rows} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="startTime"
                      tickFormatter={(value) => `${ymd(value).slice(5)} ${hhmm(value)}`}
                      interval={Math.max(0, Math.ceil(rows.length / 8) - 1)}
                      tick={{ fill: 'var(--chart-label)', fontSize: 11 }}
                      minTickGap={18}
                    />
                    <YAxis width={68} tick={{ fill: 'var(--chart-label)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--chart-tooltip)', borderColor: 'var(--chart-grid)', color: 'var(--chart-label)' }}
                      labelFormatter={(value) => `${ymd(value)} ${hhmm(value)} UTC`}
                      formatter={(value, name) => [mw(value), name]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="forecast_mw" name="Forecast" stroke="#047857" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="actual_mw" name="Actual" stroke="#1d4ed8" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </Async>

          <Async status={metricsRequest.status} error={metricsRequest.error} retry={metricsRequest.retry} skeleton="table">
            {metricsRequest.data?.summary?.n === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                No matching forecast and actual wind hours were found for this period.
              </p>
            ) : (
              <div className="space-y-6">
                <MetricCards summary={metricsRequest.data?.summary} />
                <BreakdownChart data={metricsRequest.data} />
              </div>
            )}
          </Async>
        </div>
      )}
    </div>
  )
}

export default AccuracyView
