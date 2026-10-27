import { mw, number } from '../format.js'

const metrics = [
  {
    key: 'mae_mw',
    title: 'Typical miss',
    format: mw,
    hint: 'Average size of the forecast error, in either direction.',
  },
  {
    key: 'p90_over_forecast_mw',
    title: 'Safety buffer',
    format: mw,
    hint: 'In 1 hour out of 10 the forecast was higher than reality by more than this, so the buyer was short.',
  },
  {
    key: 'bias_mw',
    title: 'Bias',
    format: mw,
    hint: 'Positive means forecasts tend to run high; negative means they tend to run low.',
  },
  {
    key: 'rmse_mw',
    title: 'RMSE',
    format: mw,
    hint: 'Like a typical miss, but larger errors count more heavily.',
  },
  {
    key: 'wmape_pct',
    title: 'Error as % of wind produced',
    format: (value) => (value === null || value === undefined ? '—' : `${number(value)}%`),
    hint: 'Total absolute forecast error compared with total wind output.',
  },
  {
    key: 'n',
    title: 'Hours compared',
    format: (value) => (value === null || value === undefined ? '—' : number(value, 0)),
    hint: 'Number of forecast hours with an actual wind reading.',
  },
]

function MetricCards({ summary }) {
  return (
    <section aria-label="Forecast accuracy summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {metrics.map((metric) => (
        <article key={metric.key} className="min-h-36 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{metric.title}</h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{metric.format(summary?.[metric.key])}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{metric.hint}</p>
        </article>
      ))}
    </section>
  )
}

export default MetricCards
