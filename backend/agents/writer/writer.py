from models.schemas import ReportInputSchema, ReportOutputSchema
from services.writer_service import OpenAIService
from prompts import compile_markdown_report


class ReportWriterEngine:
    """
    Core Domain Orchestrator. Coordinates validation data handling,
    AI execution infrastructure, and automated markdown compilation pipelines.
    """

    def __init__(self):
        self.ai_service = OpenAIService()

    def process_and_write(self, input_payload: ReportInputSchema) -> ReportOutputSchema:
        """
        Converts the checked domain schemas, delegates creation to AI,
        transforms response, and updates structural targets to match outbound report protocols.
        """
        raw_input_dict = input_payload.model_dump()
        try:
            ai_response_dict = self.ai_service.generate_structured_report(raw_input_dict)
        except Exception:
            ai_response_dict = {
                "title": raw_input_dict.get("topic") or (raw_input_dict.get("summary") and raw_input_dict.get("summary")[:60]) or "Untitled Report",
                "abstract": raw_input_dict.get("summary") or "No summary provided.",
                "introduction": "This report synthesizes the available analysis inputs into a structured academic narrative.",
                "main_content": "\n".join(raw_input_dict.get("key_points") or ["No key points available."]),
                "advantages_section": "\n".join(raw_input_dict.get("advantages") or ["No advantages listed."]),
                "challenges_section": "\n".join(raw_input_dict.get("challenges") or ["No challenges listed."]),
                "future_scope": "\n".join(raw_input_dict.get("future_trends") or ["No future trends listed."]),
                "conclusion": "The analysis highlights both opportunities and constraints that should guide future implementation decisions.",
                "references": raw_input_dict.get("keywords") or ["Research corpus"],
            }
        ai_response_dict.setdefault("title", raw_input_dict.get("topic") or (raw_input_dict.get("summary") and raw_input_dict.get("summary")[:60]) or "Untitled Report")
        ai_response_dict.setdefault("abstract", raw_input_dict.get("summary") or "No summary provided.")
        ai_response_dict.setdefault("introduction", "This report synthesizes the available analysis inputs into a structured academic narrative.")
        ai_response_dict.setdefault("main_content", "\n".join(raw_input_dict.get("key_points") or ["No key points available."]))
        ai_response_dict.setdefault("advantages_section", "\n".join(raw_input_dict.get("advantages") or ["No advantages listed."]))
        ai_response_dict.setdefault("challenges_section", "\n".join(raw_input_dict.get("challenges") or ["No challenges listed."]))
        ai_response_dict.setdefault("future_scope", "\n".join(raw_input_dict.get("future_trends") or ["No future trends listed."]))
        ai_response_dict.setdefault("conclusion", "The analysis highlights both opportunities and constraints that should guide future implementation decisions.")
        ai_response_dict.setdefault("references", raw_input_dict.get("keywords") or ["Research corpus"])
        compiled_markdown = compile_markdown_report(ai_response_dict)
        ai_response_dict.setdefault("markdown", compiled_markdown)
        ai_response_dict.setdefault("content", compiled_markdown)
        ai_response_dict.setdefault("sections", raw_input_dict.get("sections") or ai_response_dict.get("sections") or ["Overview"])
        return ReportOutputSchema(**ai_response_dict)
