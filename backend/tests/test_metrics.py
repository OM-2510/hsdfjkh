import pandas as pd
import pytest

from app.services.metrics import summary
from app.services.analysis import build_comparison

DF = pd.DataFrame({"forecast_mw": [110, 80], "actual_mw": [100, 100],
                   "error_mw": [10, -20]})


def test_bias_sign_and_value():
    assert summary(DF)["bias_mw"] == pytest.approx(-5.0)     


def test_mae():
    assert summary(DF)["mae_mw"] == pytest.approx(15.0)  


def test_rmse():
    assert summary(DF)["rmse_mw"] == pytest.approx(15.8, abs=0.1)  


def test_wmape():
    assert summary(DF)["wmape_pct"] == pytest.approx(15.0)   


def test_p90_abs_error():
    assert summary(DF)["p90_abs_error_mw"] == pytest.approx(19.0)


def test_empty_input_does_not_crash():
    out = summary(DF.iloc[0:0])
    assert out["n"] == 0 and out["mae_mw"] is None


def test_comparison_uses_cutoff_forecast_only():
    t = pd.Timestamp("2026-01-15 15:00", tz="UTC")
    forecasts = pd.DataFrame({
        "startTime": [t, t],
        "publishTime": pd.to_datetime(["2026-01-14 07:30", "2026-01-14 09:30"], utc=True),
        "forecast_mw": [100, 999],                
    })
    actuals = pd.DataFrame({"startTime": [t], "actual_mw": [90]})
    out = build_comparison(forecasts, actuals, "2026-01-15", "2026-01-15")
    assert out["forecast_mw"].tolist() == [100]
    assert out["error_mw"].tolist() == [10]