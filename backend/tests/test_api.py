from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_decision_only_uses_forecasts_before_cutoff():
    r = client.get("/api/decision", params={"day": "2026-01-15"})
    body = r.json()
    assert r.status_code == 200 and len(body["rows"]) > 0
    assert all(row["publishTime"] < body["cutoff_utc"] for row in body["rows"])


def test_bad_date_is_rejected():
    assert client.get("/api/decision", params={"day": "not-a-date"}).status_code == 422


def test_out_of_range_is_rejected():
    assert client.get("/api/decision", params={"day": "2026-03-01"}).status_code == 400


def test_end_before_start_is_rejected():
    r = client.get("/api/metrics", params={"start": "2026-01-10", "end": "2026-01-05"})
    assert r.status_code == 400


def test_bad_cutoff_is_rejected():
    r = client.get("/api/decision", params={"day": "2026-01-15", "cutoff": "banana"})
    assert r.status_code == 422


def test_metrics_shape():
    r = client.get("/api/metrics", params={"start": "2026-01-02", "end": "2026-01-31"})
    body = r.json()
    assert r.status_code == 200 and body["summary"]["n"] > 0
    assert {"by_hour", "by_horizon", "by_wind_level"} <= body.keys()