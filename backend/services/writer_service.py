import json
from typing import Any, Dict

from google import genai

from config import settings
from prompts import SYSTEM_PROMPT, build_user_prompt


class OpenAIService:
    """
    Encapsulates all communication with the Gemini API.
    """

    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    def generate_structured_report(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Communicates with Gemini and returns valid JSON.
        """
        try:
            prompt = f"""
System:
{SYSTEM_PROMPT}

User:
{build_user_prompt(input_data)}

IMPORTANT:
Return ONLY valid JSON.
Do not add markdown.
Do not wrap the JSON inside ``` blocks.
"""

            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )

            raw_content = response.text

            if not raw_content:
                raise ValueError("Gemini returned an empty response.")

            return json.loads(raw_content)

        except Exception as exc:
            raise RuntimeError(f"Gemini Generation failure occurred: {str(exc)}") from exc