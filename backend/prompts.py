SYSTEM_PROMPT = """
You are an expert research report writer. Return a JSON object with the following keys:
- title: string
- summary: string
- sections: array of strings
- content: string
The content field should be a polished markdown report.
""".strip()


def build_user_prompt(input_data: dict) -> str:
    """Create the user prompt for the writer service from report input data."""
    topic = input_data.get("topic") or input_data.get("title") or "Untitled Report"
    summary = input_data.get("summary") or ""
    sections = input_data.get("sections") or []
    return (
        f"Create a polished report for the topic '{topic}'.\n"
        f"Summary: {summary}\n"
        f"Sections: {', '.join(sections) if sections else 'Overview'}"
    )


def compile_markdown_report(report_data: dict) -> str:
    """Render a minimal markdown report from a structured report payload."""
    title = report_data.get("title") or report_data.get("topic") or "Untitled Report"
    abstract = report_data.get("abstract") or report_data.get("summary") or ""
    introduction = report_data.get("introduction") or ""
    main_content = report_data.get("main_content") or ""
    advantages_section = report_data.get("advantages_section") or ""
    challenges_section = report_data.get("challenges_section") or ""
    future_scope = report_data.get("future_scope") or ""
    conclusion = report_data.get("conclusion") or ""
    references = report_data.get("references") or []

    lines = [f"# {title}", "", "## Abstract", "", abstract, "", "## Introduction", "", introduction, "", "## Main Content", "", main_content, "", "## Advantages", "", advantages_section, "", "## Challenges", "", challenges_section, "", "## Future Scope", "", future_scope, "", "## Conclusion", "", conclusion, "", "## References", ""]
    for ref in references:
        lines.append(f"- {ref}")
    return "\n".join(lines).strip()
