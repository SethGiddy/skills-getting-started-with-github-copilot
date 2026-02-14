import copy

import pytest
from fastapi.testclient import TestClient

# import the application module so we can talk to it and reset state
from src import app as app_module

client = TestClient(app_module.app)
# keep a pristine copy of the activity data so tests can restore it
_initial_state = copy.deepcopy(app_module.activities)


@pytest.fixture(autouse=True)
def restore_state():
    """Reset the in-memory database before each test."""
    app_module.activities = copy.deepcopy(_initial_state)
    yield


def test_get_activities_returns_ok():
    resp = client.get("/activities")
    assert resp.status_code == 200
    body = resp.json()
    # should be a dict with at least one known activity
    assert "Chess Club" in body


def test_signup_and_duplicate_prevention():
    email = "test@example.com"
    activity = "Chess Club"

    # initial signup should succeed
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert email in client.get("/activities").json()[activity]["participants"]

    # repeating the signup should produce 400
    resp2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp2.status_code == 400
    assert "already signed up" in resp2.json()["detail"]


def test_delete_participant():
    email = "john@mergington.edu"
    activity = "Gym Class"

    # ensure the participant exists initially
    assert email in client.get("/activities").json()[activity]["participants"]

    resp = client.delete(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert email not in client.get("/activities").json()[activity]["participants"]

    # deleting again should result in 404
    resp2 = client.delete(f"/activities/{activity}/signup?email={email}")
    assert resp2.status_code == 404
    assert "not signed up" in resp2.json()["detail"]
