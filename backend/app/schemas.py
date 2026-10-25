from pydantic import BaseModel


class DecisionRow(BaseModel):
    startTime: str     
    publishTime: str     
    forecast_mw: float
    horizon_h: float     


class DecisionResponse(BaseModel):
    delivery_day: str
    cutoff_utc: str     
    rows: list[DecisionRow]


class CompareRow(BaseModel):
    startTime: str
    forecast_mw: float
    actual_mw: float
    error_mw: float    
    horizon_h: float


class CompareResponse(BaseModel):
    rows: list[CompareRow]


class Summary(BaseModel):
    n: int
    bias_mw: float | None            
    mae_mw: float | None
    rmse_mw: float | None
    wmape_pct: float | None
    p90_abs_error_mw: float | None
    p90_over_forecast_mw: float | None


class HourStats(Summary):
    hour: int          


class HorizonStats(Summary):
    horizon: str       


class WindLevelStats(Summary):
    level: str          


class MetricsResponse(BaseModel):
    summary: Summary
    by_hour: list[HourStats]
    by_horizon: list[HorizonStats]
    by_wind_level: list[WindLevelStats]