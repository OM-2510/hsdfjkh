from datetime import time

import pandas as pd

from app.services.cutoff import cutoff_utc, forecast_at_cutoff

TARGET = "2026-01-15 15:00"


def make(rows):
    df = pd.DataFrame(rows, columns=["publishTime", "forecast_mw"])
    df["startTime"] = pd.Timestamp(TARGET, tz="UTC")
    df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True)
    return df


def test_cutoff_january_is_utc():
    assert cutoff_utc("2026-01-15") == pd.Timestamp("2026-01-14 09:20", tz="UTC")


def test_cutoff_summer_shifts_to_utc_minus_one():
    assert cutoff_utc("2026-07-15") == pd.Timestamp("2026-07-14 08:20", tz="UTC")


def test_picks_latest_forecast_before_cutoff():
    df = make([("2026-01-14 02:30", 50), ("2026-01-14 07:30", 100),
               ("2026-01-14 09:30", 200)])
    out = forecast_at_cutoff(df, "2026-01-15")
    assert out["forecast_mw"].tolist() == [100]  # 09:30 batch is too late


def test_forecast_published_after_cutoff_is_excluded():
    df = make([("2026-01-14 09:30", 200), ("2026-01-15 22:30", 300)])
    assert forecast_at_cutoff(df, "2026-01-15").empty


def test_forecast_published_exactly_at_cutoff_is_excluded():
    df = make([("2026-01-14 09:20", 999), ("2026-01-14 07:30", 100)])
    assert forecast_at_cutoff(df, "2026-01-15")["forecast_mw"].tolist() == [100]


def test_n2ex_cutoff_allows_0930_batch():
    df = make([("2026-01-14 07:30", 100), ("2026-01-14 09:30", 200)])
    out = forecast_at_cutoff(df, "2026-01-15", cutoff=time(9, 50))
    assert out["forecast_mw"].tolist() == [200]


def test_other_delivery_day_is_ignored():
    df = make([("2026-01-14 07:30", 100)])
    assert forecast_at_cutoff(df, "2026-01-16").empty