import pandas as pd
from .config import DEFAULT_CUTOFF
from .cutoff import forecast_at_cutoff


def build_comparison(forecasts, actuals, start, end, cutoff=DEFAULT_CUTOFF):
    frames = [forecast_at_cutoff(forecasts, day, cutoff)
              for day in pd.date_range(start, end)]
    
    frames = [f for f in frames if not f.empty]

    if not frames:
        return pd.DataFrame(columns=["startTime", "publishTime", "forecast_mw",
                                     "horizon_h", "actual_mw", "error_mw"])
    
    df = pd.concat(frames, ignore_index=True)

    # inner join
    df = df.merge(actuals, on="startTime", how="inner")
    df["error_mw"] = df["forecast_mw"] - df["actual_mw"]  
    
    return df.sort_values("startTime").reset_index(drop=True)