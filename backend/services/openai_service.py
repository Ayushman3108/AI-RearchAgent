import json

from google import genai

try:
    from config import config, settings
except ImportError:
    from backend.config import config, settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_review(system_prompt: str, user_text: str) -> dict:
    """
    Calls the Gemini API and returns a JSON response.
    """

    prompt = f"""
System:
{system_prompt}

User:
{user_text}

IMPORTANT:
Return ONLY valid JSON.
Do not add markdown.
Do not wrap the JSON in ``` blocks.
"""

    response = client.models.generate_content(
        model=config.MODEL_NAME,
        contents=prompt,
    )

    raw_content = response.text

    try:
        return json.loads(raw_content)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Failed to parse JSON from Gemini:\n{raw_content}"
        ) from exc