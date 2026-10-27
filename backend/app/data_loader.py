from pathlib import Path
import pandas as pd
import requests

BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"
DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _get(dataset: str, params: dict) -> pd.DataFrame:
    r = requests.get(f"{BASE}/{dataset}/stream", params=params, timeout=120)
    r.raise_for_status()       
    return pd.DataFrame(r.json()) 


def _chunks(start: str, end: str, days: int):
    cur, stop = pd.Timestamp(start), pd.Timestamp(end)
    while cur <= stop:
        nxt = min(cur + pd.Timedelta(days=days - 1), stop)
        yield cur, nxt           
        cur = nxt + pd.Timedelta(days=1)


def fetch_actuals(start: str, end: str) -> pd.DataFrame:
    frames = [
        _get("FUELHH", {
            "settlementDateFrom": s.strftime("%Y-%m-%d"),
            "settlementDateTo": e.strftime("%Y-%m-%d"),
            "fuelType": "WIND",
        }) 
        for s, e in _chunks(start, end, 7)  
    ]

    df = pd.concat(frames, ignore_index=True)    
    df = df[df["fuelType"] == "WIND"].copy()        
    df["startTime"] = pd.to_datetime(df["startTime"], utc=True)  
    df = df.rename(columns={"generation": "actual_mw"})

    return (df[["startTime", "actual_mw"]]          
            .drop_duplicates("startTime")           
            .sort_values("startTime"))


def fetch_forecasts(start: str, end: str) -> pd.DataFrame:
    frames = [
        _get("WINDFOR", {
            "publishDateTimeFrom": s.strftime("%Y-%m-%dT00:00:00Z"),
            "publishDateTimeTo": (e + pd.Timedelta(days=1)).strftime("%Y-%m-%dT00:00:00Z"),
        })
        for s, e in _chunks(start, end, 3)   
    ]

    df = pd.concat(frames, ignore_index=True)
    df["startTime"] = pd.to_datetime(df["startTime"], utc=True)
    df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True)
    df = df.rename(columns={"generation": "forecast_mw"})
    
    return (df[["startTime", "publishTime", "forecast_mw"]]
            .drop_duplicates(["startTime", "publishTime"])  
            .sort_values(["startTime", "publishTime"]))


if __name__ == "__main__":        
    DATA_DIR.mkdir(exist_ok=True)                     
    actuals = fetch_actuals("2026-01-02", "2026-02-01")        
    forecasts = fetch_forecasts("2025-12-25", "2026-02-01")   
    actuals.to_csv(DATA_DIR / "actuals_wind.csv", index=False)
    forecasts.to_csv(DATA_DIR / "forecasts_wind.csv", index=False)

    print("actuals:", len(actuals), actuals.startTime.min(), actuals.startTime.max())
    print("forecasts:", len(forecasts), forecasts.publishTime.min(), forecasts.publishTime.max())
    print("publish times per day:\n", forecasts.groupby(forecasts.publishTime.dt.date).publishTime.nunique().describe())