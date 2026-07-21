import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agents.reviewer.reviewer import ReviewerAgent
from services import openai_service


def test_reviewer_agent_builds_response_without_model(monkeypatch):
    agent = ReviewerAgent()

    monkeypatch.setattr(agent, "review_report", lambda report: {
        "reviewed_report": report,
        "grammar_score": 90,
        "readability_score": 88,
        "formatting_score": 92,
        "suggestions": ["Improve clarity"],
    })

    result = agent.review_report("Sample report")
    assert result["reviewed_report"] == "Sample report"
    assert result["grammar_score"] == 90


def test_generate_review_uses_configured_model_name(monkeypatch):
    captured = {}

    class FakeCompletions:
        def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(
                choices=[SimpleNamespace(message=SimpleNamespace(content='{"reviewed_report":"ok"}'))]
            )

    class FakeClient:
        def __init__(self):
            self.chat = SimpleNamespace(completions=FakeCompletions())

    monkeypatch.setattr(openai_service, "client", FakeClient())

    result = openai_service.generate_review("system-prompt", "user-report")

    assert result["reviewed_report"] == "ok"
    assert captured["model"] == "gpt-4o"
