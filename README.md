# GB Wind Forecast Reliability Dashboard

A small full-stack app that helps a day-ahead power buyer answer two questions about national wind generation in Great Britain:

1. **What was the latest wind forecast available at the moment the buying decision had to be made?**
2. **How accurate were those forecasts, in numbers, so a safety buffer can be sized?**

**Deployed site:** [hsdfjkh.vercel.app](https://hsdfjkh.vercel.app/)

## The problem in one minute

A utility buys electricity on the **day-ahead market**: bids for tomorrow's power close the day before delivery (the EPEX hourly auction closes at 09:20 UK time, N2EX at 09:50). Wind output depends on the weather, so the buyer relies on wind forecasts to decide how much extra power to buy from other sources.

The catch: the same hour is forecast many times, and some forecasts are published only *after* the hour they describe. A fair accuracy analysis must use **only the forecast that existed when the buyer had to decide**. Using the newest forecast ever published would make the forecasts look far better than they were.

## Key results (Jan 2–31, 09:20 UK cutoff, 720 hours)

| Measure | Value | Meaning |
|---|---|---|
| Typical miss (MAE) | ~2,058 MW | Average size of the forecast error |
| Safety buffer (P90 over-forecast) | ~4,189 MW | In 1 hour out of 10, the forecast exceeded reality by more than this |
| Bias | ~+1,773 MW | Forecasts tended to run **high**, so a buyer relying on them would tend to under-buy |
| Error vs wind produced | ~18% | Total absolute error as a share of total wind output |
| RMSE | ~2,532 MW | Like MAE, but large misses count more |

**The bias is an observation from the data.**

## Features

- **Decision view:** pick a delivery day and a cutoff (09:20 EPEX or 09:50 N2EX). See the forecast the buyer could have seen, which forecast batch it came from, and how many hours ahead each value was.
- **Forecast accuracy view:** pick a date range. See forecast vs actual wind, summary metrics, and error breakdowns by hour of day, forecast horizon, and wind level.
- Loading skeletons, error messages with retry, and a "server may be waking up" notice for slow first loads.

## Design decisions and assumptions

- **Decision cutoff:** the buyer decides at the gate closure of the earlier GB day-ahead auction on the day before delivery. It is configurable for **9:20 EPEX or 9:50 N2EX**. A forecast published exactly at the cutoff is excluded.

- **Latest forecast before the cutoff:** for each hour, take the batch with the latest `publishTime` strictly before the deadline.

- **"Decisions made in January":** decisions on Jan 1–31 cover delivery days Jan 2 – Feb 1; actuals and forecasts are fetched accordingly.

- **Resolution mismatch:** actuals (`FUELHH`) are half-hourly, forecasts (`WINDFOR`) are hourly. Comparison uses an inner join on `startTime`, so only hours present in both are compared. No half-hour values are interpolated.

- **Time handling:** everything is stored and compared in UTC. The cutoff is defined in `Europe/London` and converted to UTC, so the logic stays correct in summer too. In January UK time equals UTC.

- **Cached data:** Elexon data is fetched once by a script and committed to `backend/data/`, so the app is fast and does not depend on Elexon being reachable.

- **Metrics:** bias, MAE, RMSE, weighted percentage error, and the 90th percentile of error. Percentage error is weighted (total error / total wind) because ordinary MAPE blows up when wind is near zero.

- **Structure:** four read-only endpoints and no database, so the backend is deliberately flat: pure logic modules, response schemas, one API file.

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app and endpoints
│   │   ├── schemas.py         # Response models
│   │   ├── data_loader.py     # Fetches and caches Elexon data
│   │   ├── core/config.py     # Cutoff default, timezone
│   │   └── services/
│   │       ├── cutoff.py      # "latest forecast before the deadline" logic
│   │       ├── analysis.py    # Builds the forecast-vs-actual table
│   │       └── metrics.py     # Error metrics and breakdowns
│   ├── data/                  # Cached actuals and forecasts (CSV)
│   ├── scripts/explore.py     # Data exploration script used during design
│   ├── tests/                 # Unit and API tests
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── uv.lock
├── frontend/
│   ├── src/
│   │   ├── components/        # Views, charts, metric cards, controls
│   │   ├── hooks/useFetch.js  # Loading / error / abort handling
│   │   ├── api.js, format.js
│   │   └── App.jsx
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

## Run it

### With Docker

```
docker compose up --build
```

- Backend: http://localhost:8080
- API docs: http://localhost:8000/docs
- Fronted : http://localhost:8080

### Without Docker

Backend (requires [uv](https://docs.astral.sh/uv/)):

```
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

Frontend (Node 22):

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (Vite forwards `/api` calls to port 8000).

### Tests

```
cd backend
uv run pytest
```

Tests cover the cutoff logic (including the exact-cutoff boundary, the 09:50 alternative and a summer-time case), the metrics (hand-checked values and empty input), and the API (validation and response shape).

### Refresh the cached data (optional)

```
cd backend
uv run python -m app.data_loader
```

## API

All endpoints are `GET`. Valid delivery days are 2026-01-02 to 2026-02-01. Interactive docs are at `/docs`.

| Endpoint | Parameters | Returns |
|---|---|---|
| `/api/health` | none | `{"status": "ok"}` |
| `/api/decision` | `day`, `cutoff` (HH:MM, default 09:20) | Forecast per hour available at the cutoff, with publish time and hours ahead |
| `/api/compare` | `start`, `end`, `cutoff` | Forecast vs actual per hour, with error |
| `/api/metrics` | `start`, `end`, `cutoff` | Summary metrics plus breakdowns by hour, horizon and wind level |

Invalid dates return 422, out-of-range or reversed dates return 400.


## AI tools used

I used **Claude** and **GitHub Copilot** as assistants during this project, mainly for drafting boilerplate (API scaffolding, React components, Docker files), finding optimal comparsion metrics and first drafts of unit tests. The design decisions (cutoff assumption, hourly comparison, metric choices) are mine, and I reviewed, ran and adjusted the generated code and tests.
