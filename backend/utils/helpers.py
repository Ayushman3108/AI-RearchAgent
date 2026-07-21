import re
import json
import time
import logging
from typing import Callable, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AnalysisAgentUtils")


def setup_logger():
    """
    Initializes standard runtime execution system logging.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler()],
    )
    return logging.getLogger("ReportWriterAgent")

def clean_json_string(raw_text: str) -> str:
    """
    Strips accidental markdown code block wrappers from the LLM output.
    Even with strict prompts, LLMs occasionally output markdown.
    """
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    return cleaned.strip()


def clean_ai_response(raw_text: str) -> str:
    """Cleans common formatting patterns out of raw LLM outputs."""
    if not raw_text:
        return ""
    return clean_json_string(raw_text)

def safe_parse_json(text: str) -> dict:
    """Attempts to cleanly parse JSON text, including manual extraction steps if necessary."""
    cleaned = clean_ai_response(text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Standard parsing failed. Attempting regex extraction.")
        
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError as e:
                raise ValueError(f"Extracted string failed verification: {str(e)}")
        raise ValueError("No structurally valid JSON block found in payload.")

def get_word_count(text: str) -> int:
    """Return the number of whitespace-delimited words in a text block."""
    return len(text.split())


def get_character_count(text: str) -> int:
    """Return the number of characters in a text block."""
    return len(text)


def retry_on_failure(retries: int = 3, delay: float = 1.0) -> Callable:
    """Decorator to apply exponential backoff strategies to unstable connections."""
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs) -> Any:
            current_delay = delay
            for attempt in range(1, retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logger.error(f"Attempt {attempt}/{retries} for {func.__name__} failed with error: {e}")
                    if attempt == retries:
                        raise e
                    time.sleep(current_delay)
                    current_delay *= 2
            return None
        return wrapper
    return decorator