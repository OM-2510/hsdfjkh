from datetime import date
from functools import lru_cache
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .services import metrics
from .services.analysis import build_comparison
from .services.cutoff import cutoff_utc, forecast_at_cutoff
from .data_loader import DATA_DIR
from .schemas import DecisionResponse, CompareResponse, MetricsResponse

FIRST_DAY, LAST_DAY = date(2026, 1, 2), date(2026, 2, 1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_data()
    yield


app = FastAPI(title="Wind forecast accuracy API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])


@lru_cache
def load_data():
    actuals = pd.read_csv(DATA_DIR / "actuals_wind.csv", parse_dates=["startTime"])
    forecasts = pd.read_csv(DATA_DIR / "forecasts_wind.csv", parse_dates=["startTime", "publishTime"])
    
    return actuals, forecasts


def parse_cutoff(value: str):
    try:
        return pd.Timestamp(f"2000-01-01 {value}").time()
    
    except ValueError:
        raise HTTPException(422, "cutoff must look like HH:MM, e.g. 09:20")


def check_range(start: date, end: date):
    if start > end:
        raise HTTPException(400, "start must be on or before end")
    
    if start < FIRST_DAY or end > LAST_DAY:
        raise HTTPException(400, f"dates must be between {FIRST_DAY} and {LAST_DAY}")


def to_rows(df, cols):
    out = df[cols].copy()
    for c in ("startTime", "publishTime"):
        if c in out:
            out[c] = out[c].dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    return out.to_dict(orient="records")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/decision", response_model=DecisionResponse)
def decision(day: date, cutoff: str = "09:20"):
    check_range(day, day)
    t = parse_cutoff(cutoff)
    _, forecasts = load_data()
    df = forecast_at_cutoff(forecasts, day, t)
    
    return {
        "delivery_day": str(day),
        "cutoff_utc": cutoff_utc(day, t).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rows": to_rows(df, ["startTime", "publishTime", "forecast_mw", "horizon_h"]),
    }


@app.get("/api/compare", response_model=CompareResponse)
def compare(start: date, end: date, cutoff: str = "09:20"):
    check_range(start, end)
    actuals, forecasts = load_data()
    df = build_comparison(forecasts, actuals, start, end, parse_cutoff(cutoff))
    return {"rows": to_rows(df, ["startTime", "forecast_mw", "actual_mw", "error_mw", "horizon_h"])}


@app.get("/api/metrics", response_model=MetricsResponse)
def get_metrics(start: date, end: date, cutoff: str = "09:20"):
    check_range(start, end)
    actuals, forecasts = load_data()
    df = build_comparison(forecasts, actuals, start, end, parse_cutoff(cutoff))
    if df.empty:
        return {"summary": metrics.summary(df), "by_hour": [], "by_horizon": [], "by_wind_level": []}
    return {
        "summary": metrics.summary(df),
        "by_hour": metrics.by_hour(df),
        "by_horizon": metrics.by_horizon(df),
        "by_wind_level": metrics.by_wind_level(df),
    }