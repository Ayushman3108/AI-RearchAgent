import json
import logging
from typing import Any, Dict

from fastapi import HTTPException

from services.openai_service import generate_review
from utils.helpers import get_character_count, get_word_count
from .prompts import REVIEW_SYSTEM_PROMPT

logger = logging.getLogger("ReviewerAgent")


def _heuristic_scores(report: str) -> Dict[str, int]:
    """Generate lightweight, text-dependent scores when the AI service is unavailable."""
    words = len(report.split())
    punctuation = sum(1 for ch in report if ch in "!?.,;:")
    sentence_count = max(1, len([part for part in report.split('.') if part.strip()]))

    grammar_score = min(99, 78 + min(15, max(0, words // 40)))
    readability_score = min(99, 74 + min(15, max(0, punctuation // 8)))
    formatting_score = min(99, 80 + min(12, max(0, sentence_count // 2)))
    return {
        "grammar_score": grammar_score,
        "readability_score": readability_score,
        "formatting_score": formatting_score,
    }


class ReviewerAgent:
    """Review report text and return a polished version with scoring metadata."""

    def __init__(self) -> None:
        self.system_prompt = REVIEW_SYSTEM_PROMPT

    def review_report(self, report: str) -> Dict[str, Any]:
        if not report or not report.strip():
            raise ValueError("The report field cannot be empty.")

        try:
            ai_result = generate_review(self.system_prompt, report)
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.warning("Reviewer model call failed: %s", exc)
            heuristic = _heuristic_scores(report)
            ai_result = {
                "reviewed_report": report.strip(),
                "grammar_score": heuristic["grammar_score"],
                "readability_score": heuristic["readability_score"],
                "formatting_score": heuristic["formatting_score"],
                "suggestions": ["The AI review service is unavailable; the report was returned unchanged."],
            }

        reviewed_report = ai_result.get("reviewed_report", report.strip())
        grammar_score = int(ai_result.get("grammar_score") or 90)
        readability_score = int(ai_result.get("readability_score") or 88)
        formatting_score = int(ai_result.get("formatting_score") or 92)
        suggestions = ai_result.get("suggestions") or []

        if not isinstance(suggestions, list):
            suggestions = [str(suggestions)]

        return {
            "reviewed_report": reviewed_report,
            "grammar_score": grammar_score,
            "readability_score": readability_score,
            "formatting_score": formatting_score,
            "suggestions": suggestions,
            "word_count": get_word_count(reviewed_report),
            "character_count": get_character_count(reviewed_report),
        }


reviewer_agent = ReviewerAgent()
