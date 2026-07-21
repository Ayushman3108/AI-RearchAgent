import json

SYSTEM_PROMPT = """You are an elite, senior research paper writer and software architect. Your objective is to compile unstructured or semi-structured analytical data fragments into a cohesive, rigorous, and highly formal academic research report.

Strict Operational Guidelines:
1. Do NOT invent, extrapolate, or assume any facts, figures, dates, or assertions outside of the explicitly supplied structured analysis variables.
2. Maintain a completely objective, peer-reviewed academic tone.
3. Establish fluid narrative transitions between all sections.
4. Output must be structurally flawless and follow the exact JSON format requested.
5. Do NOT wrap your output in markdown code blocks like ```json ... ```. Return ONLY a single raw JSON object that can be parsed instantly.

You must populate the following structural keys in your JSON object:
- title: A compelling, highly professional research title based on the keywords and summary.
- abstract: A clear summary of the core findings.
- introduction: A thorough introductory section setting up the context using the summary and key points.
- main_content: A detailed structural discourse connecting the key points and supporting statistics.
- advantages_section: A comprehensive essay-style overview of the advantages provided.
- challenges_section: A detailed structural breakdown of the technical or organizational challenges.
- future_scope: A synthesis of future trends, mapping a strategic roadmap.
- conclusion: A closing analytical section reinforcing the report's absolute deductions.
- references: A list of formally formatted academic or corporate citations (e.g., IEEE/APA style placeholders built explicitly out of the keywords, subject domain, and analysis context). Do not reference external materials not implied by the provided text."""

def build_user_prompt(data: dict) -> str:
    """
    Injects the validated runtime dictionary payload into the prompt layout.
    """
    return f"""Transform the following structured source metrics into a structured JSON research document.

Source Analytics Data:
{json.dumps(data, indent=2)}

Generate the exact JSON schema requested."""

def compile_markdown_report(data: dict) -> str:
    """
    Programmatically compiles individual structural sections into a unified markdown document.
    """
    references_str = "\n".join([f"- {ref}" for ref in data.get("references", [])])
    
    return f"""# {data.get('title', 'Research Report')}

## Abstract
{data.get('abstract', '')}

---

## 1. Introduction
{data.get('introduction', '')}

## 2. Main Discussion
{data.get('main_content', '')}

## 3. Comparative Analysis: Advantages
{data.get('advantages_section', '')}

## 4. Architectural Challenges
{data.get('challenges_section', '')}

## 5. Future Scope & Emerging Horizons
{data.get('future_scope', '')}

## 6. Conclusion
{data.get('conclusion', '')}

---

## References
{references_str}
"""