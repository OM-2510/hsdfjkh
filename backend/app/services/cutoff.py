from datetime import datetime, time, timedelta
import pandas as pd
from ..core.config import DEFAULT_CUTOFF, LONDON


def _london_to_utc(day, t: time) -> pd.Timestamp:
    return pd.Timestamp(datetime.combine(day, t, tzinfo=LONDON)).tz_convert("UTC")


def cutoff_utc(delivery_date, cutoff: time = DEFAULT_CUTOFF) -> pd.Timestamp:
    day_before = pd.Timestamp(delivery_date).date() - timedelta(days=1)
    return _london_to_utc(day_before, cutoff)


def forecast_at_cutoff(forecasts: pd.DataFrame, delivery_date, cutoff: time = DEFAULT_CUTOFF) -> pd.DataFrame:
    day = pd.Timestamp(delivery_date).date()
    start = _london_to_utc(day, time(0, 0))
    end = _london_to_utc(day + timedelta(days=1), time(0, 0))
    deadline = cutoff_utc(delivery_date, cutoff)

    eligible = forecasts[
        (forecasts["publishTime"] < deadline)
        & (forecasts["startTime"] >= start)
        & (forecasts["startTime"] < end)
    ]
    
    out = (eligible
           .sort_values(["startTime", "publishTime"])
           .drop_duplicates("startTime", keep="last")
           .copy()
        )
    
    out["horizon_h"] = (out["startTime"] - out["publishTime"]).dt.total_seconds() / 3600
    return out.reset_index(drop=True)