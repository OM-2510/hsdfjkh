import numpy as np
import pandas as pd
from ..core.config import LONDON


def summary(df: pd.DataFrame) -> dict:
    if df.empty:
        return {"n": 0, "bias_mw": None, "mae_mw": None, "rmse_mw": None,
                "wmape_pct": None, "p90_abs_error_mw": None, "p90_over_forecast_mw": None}
    
    e = df["error_mw"]
    ae = e.abs()
    return {
        "n": int(len(df)),
        "bias_mw": round(float(e.mean()), 1),                    
        "mae_mw": round(float(ae.mean()), 1),                    
        "rmse_mw": round(float(np.sqrt((e ** 2).mean())), 1),     
        "wmape_pct": round(float(ae.sum() / df["actual_mw"].sum() * 100), 1),
        "p90_abs_error_mw": round(float(np.percentile(ae, 90)), 1),   
        "p90_over_forecast_mw": round(float(np.percentile(e, 90)), 1),  
    }


def by_hour(df):
    hour = df["startTime"].dt.tz_convert(LONDON).dt.hour   
    return [{"hour": int(h), **summary(g)} for h, g in df.groupby(hour)]


def by_horizon(df):
    bucket = pd.cut(df["horizon_h"], [0, 24, 36, 48, 72],
                    labels=["<24h", "24-36h", "36-48h", "48-72h"])
    return [{"horizon": str(b), **summary(g)}
            for b, g in df.groupby(bucket, observed=True)]


def by_wind_level(df):
    level = pd.qcut(df["actual_mw"], 3, labels=["low", "medium", "high"])
    return [{"level": str(l), **summary(g)}
            for l, g in df.groupby(level, observed=True)]