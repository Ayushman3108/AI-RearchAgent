import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main


def test_write_report_endpoint_returns_report_payload():
    client = TestClient(main.app)
    response = client.post(
        "/write-report",
        json={
            "topic": "AI in Education",
            "summary": "A concise summary.",
            "sections": ["Introduction", "Challenges", "Conclusion"],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["title"] == "AI in Education"
    assert payload["content"].startswith("# AI in Education")
    assert payload["sections"] == ["Introduction", "Challenges", "Conclusion"]
