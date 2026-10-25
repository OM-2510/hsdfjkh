import requests
import pandas as pd

BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def get(dataset, params):
    r = requests.get(f"{BASE}/{dataset}/stream", params=params, timeout=60)
    print(dataset, r.status_code, r.url)
    r.raise_for_status()
    return pd.DataFrame(r.json())


actual = get("FUELHH", {
    "settlementDateFrom": "2026-01-02",
    "settlementDateTo": "2026-01-03",
    "fuelType": "WIND",
})
fc = get("WINDFOR", {
    "publishDateTimeFrom": "2026-01-01T00:00:00Z",
    "publishDateTimeTo": "2026-01-03T00:00:00Z",
})

print("\n--- ACTUALS ---")
print(actual.columns.tolist())
print(actual.head())
print("rows:", len(actual))
print("fuel types:", actual["fuelType"].unique())

print("\n--- FORECASTS ---")
print(fc.columns.tolist())
print(fc.head())
print("rows:", len(fc))

fc["startTime"] = pd.to_datetime(fc["startTime"], utc=True)
fc["publishTime"] = pd.to_datetime(fc["publishTime"], utc=True)
fc["horizon_h"] = (fc["startTime"] - fc["publishTime"]).dt.total_seconds() / 3600

print("\nunique publishTimes:", fc["publishTime"].nunique())
print(sorted(fc["publishTime"].unique())[:10])
print("forecasts per startTime:\n", fc.groupby("startTime").size().describe())
print("horizon (hours) min/max:", fc["horizon_h"].min(), fc["horizon_h"].max())
print("duplicates:", fc.duplicated(["startTime", "publishTime"]).sum())