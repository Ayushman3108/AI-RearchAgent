import logging
import re

from google import genai

from config import config
from .prompts import SYSTEM_PROMPT
from utils.helpers import safe_parse_json, retry_on_failure

logger = logging.getLogger("AnalysisAgentService")


class AnalysisAgent:
    """Handles communications with the Gemini generative layer."""

    def __init__(self):
        if not config.GEMINI_API_KEY:
            logger.critical("GEMINI_API_KEY is missing from execution environment configurations.")

        self.client = None
        if config.GEMINI_API_KEY:
            self.client = genai.Client(api_key=config.GEMINI_API_KEY)

        self.model_name = config.MODEL_NAME
        self.temperature = config.TEMPERATURE
        self.max_output_tokens = config.MAX_OUTPUT_TOKENS

    @retry_on_failure(retries=3, delay=1.5)
    def analyze_research(self, raw_text: str) -> dict:
        """Executes payload analytics against target inputs using Gemini."""

        if not raw_text or not raw_text.strip():
            raise ValueError("Provided research payload parameter values cannot evaluate to blank context.")

        print("RAW TEXT:", raw_text)
        user_message = f"Please analyze this topic in detail:\n\n{raw_text}"

        if not self.client:
            return self._fallback_analysis(raw_text, "Gemini API key is not configured")

        try:
            prompt = f"""
System:
{SYSTEM_PROMPT}

User:
{user_message}

IMPORTANT:
Return ONLY valid JSON.
Do not add markdown.
Do not wrap the JSON inside ``` blocks.
"""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )

        except Exception as api_err:
            logger.exception("Gemini endpoint encountered an API error")
            raise RuntimeError(f"Gemini API Error: {api_err}") from api_err

        content = response.text if response else ""
        print("\n========== GEMINI RESPONSE ==========")
        print(content)
        print("=====================================\n")
        if not content or not content.strip():
            return self._fallback_analysis(raw_text, "Gemini response content was empty")

        try:
            parsed_data = safe_parse_json(content)
        except Exception as parse_err:
            logger.exception("Failed to parse Gemini response")
            print("\n===== GEMINI RAW RESPONSE =====")
            print(content)
            print("===== END RESPONSE =====\n")
            raise RuntimeError(f"JSON Parse Error: {parse_err}") from parse_err

        required_keys = [
            "summary",
            "key_points",
            "statistics",
            "advantages",
            "challenges",
            "future_trends",
            "keywords",
        ]

        for key in required_keys:
            if key not in parsed_data:
                parsed_data[key] = "" if key == "summary" else []

        return parsed_data

    def _fallback_analysis(self, raw_text: str, reason: str) -> dict:
        """Generate a content-aware structured fallback when the model backend is unavailable."""

        def extract_section(title):
            pattern = rf"{re.escape(title)}\s*(.*?)(?=\n[A-Z][A-Za-z0-9 \-]+\n|\Z)"
            match = re.search(pattern, raw_text, re.S | re.I)
            return match.group(1).strip() if match else ""

        def extract_list_items(text):
            items = []
            for line in text.splitlines():
                cleaned = line.strip()
                if not cleaned:
                    continue

                number_match = re.match(r"^\s*\d+[\).\-]\s*(.*)$", cleaned)
                if number_match:
                    items.append(number_match.group(1).strip())
                    continue

                if cleaned.startswith("-") or cleaned.startswith("*"):
                    items.append(cleaned.lstrip("-* ").strip())

            return items

        executive_summary = extract_section("Executive Summary")
        advantages_section = extract_section("Core Advantages")
        challenges_section = extract_section("Engineering Challenges & Market Barriers")
        trends_section = extract_section("Future Trends & Market Outlook")

        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", raw_text) if s.strip()]

        statistics = [
            f"Input length: {len(raw_text)} characters",
            f"Sentence count: {len(sentences)}",
        ]

        key_points = extract_list_items(executive_summary) or [
            "The report contains substantive research findings.",
            "The text should be reviewed for clearer conclusions and evidence.",
        ]

        advantages = extract_list_items(advantages_section) or [
            "The content can still be indexed and summarized locally.",
            "A fallback analysis should preserve the major themes in the report.",
        ]

        challenges = extract_list_items(challenges_section) or [
            "The original model response was unavailable, so detail may be limited.",
            "Fallback analysis may omit some domain-specific metrics.",
        ]

        future_trends = extract_list_items(trends_section) or [
            "A live AI backend would enable richer structured analysis.",
            "Trends should be validated by a connected generative model for production use.",
        ]

        candidates = [
            "solid-state battery",
            "electric vehicle",
            "energy density",
            "safety",
            "manufacturing",
            "thermal runaway",
            "lithium metal",
            "electrolyte",
            "performance",
            "cost",
        ]

        keywords = [kw for kw in candidates if kw.lower() in raw_text.lower()][:8]

        if not keywords:
            keywords = [
                "research",
                "analysis",
                "fallback",
                "battery",
                "market",
            ]

        summary = executive_summary or (
            "The provided research text discusses solid-state battery technologies, safety trade-offs, and manufacturing trends in advanced energy applications."
        )

        if reason:
            summary = f"[Fallback Analysis] {summary}"

        return {
            "summary": summary,
            "key_points": key_points,
            "statistics": statistics,
            "advantages": advantages,
            "challenges": challenges,
            "future_trends": future_trends,
            "keywords": keywords,
        }