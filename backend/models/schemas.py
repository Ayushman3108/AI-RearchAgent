from typing import List

from pydantic import BaseModel, Field, field_validator


class ReportInputSchema(BaseModel):
    """
    Validates the inbound structured analysis payload received from the Analysis Agent.
    Accepts either the richer analysis-style payload or the simpler topic-based payload.
    """
    summary: str = Field(default="", description="High-level descriptive overview provided by the Analysis Agent.")
    key_points: List[str] = Field(default_factory=list, description="Core findings or themes discovered during analysis.")
    statistics: List[str] = Field(default_factory=list, description="Empirical metrics, data points, or quantitative results.")
    advantages: List[str] = Field(default_factory=list, description="Benefits, strengths, or positive attributes identified.")
    challenges: List[str] = Field(default_factory=list, description="Obstacles, gaps, or risks highlighted by the analysis.")
    future_trends: List[str] = Field(default_factory=list, description="Projections or upcoming shifts in the studied domain.")
    keywords: List[str] = Field(default_factory=list, description="Taxonomy terms and critical tags related to the research.")
    topic: str | None = Field(default=None, description="Optional topic/title for the report.")
    sections: List[str] = Field(default_factory=list, description="Optional list of section labels.")

    model_config = {
        "json_schema_extra": {
            "example": {
                "summary": "The shift toward distributed computing architectures accelerated throughout 2025.",
                "key_points": ["Edge nodes reduce latency", "Data sovereignty concerns drive local storage rules"],
                "statistics": ["Latency decreased by 40% on average", "Network bandwidth costs fell 15%"],
                "advantages": ["Near real-time execution", "Enhanced fault tolerance across regional clusters"],
                "challenges": ["Complex state synchronization", "Distributed security patch distribution profiles"],
                "future_trends": ["AI-driven semantic routing protocols", "Zero-trust edge validation matrices"],
                "keywords": ["Distributed Systems", "Edge Computing", "Architecture Engineering"],
            }
        }
    }


class ReportOutputSchema(BaseModel):
    """
    Validates the generated structured research report before returning it to the caller.
    """
    title: str = Field(..., description="The curated formal academic title of the research paper.")
    abstract: str = Field(..., description="A rigorous synthesis summarizing the context, data, and conclusions.")
    introduction: str = Field(..., description="Initial framing and situational background of the analysis domain.")
    main_content: str = Field(..., description="The comprehensive structural discussion and narrative elaboration.")
    advantages_section: str = Field(..., description="An analytical deep-dive into the benefits and positive indices.")
    challenges_section: str = Field(..., description="A realistic technical exploration of structural limits and vulnerabilities.")
    future_scope: str = Field(..., description="Forward-looking roadmap extrapolation based on emerging indicators.")
    conclusion: str = Field(..., description="Synthesized takeaways summarizing structural inputs and evaluations.")
    references: List[str] = Field(..., description="Formally structured professional academic/industry citations.")
    markdown: str = Field(..., description="The complete synthesized report compiled into standard Markdown format.")
    content: str = Field(default="", description="Compatibility alias for the compiled markdown report content.")
    sections: List[str] = Field(default_factory=list, description="Compatibility alias for the ordered section titles.")


class ResearchRequest(BaseModel):
    """Validates the incoming user request."""
    topic: str = Field(..., description="The research topic provided by the user.")

    @field_validator("topic")
    def topic_must_not_be_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Topic cannot be empty or just whitespace.")
        return value.strip()


class ResearchResponse(BaseModel):
    """Defines the strict output schema for the Research Agent."""
    topic: str
    overview: str
    key_concepts: List[str]
    important_statistics: List[str]
    current_trends: List[str]
    applications: List[str]
    advantages: List[str]
    challenges: List[str]
    future_scope: List[str]
    references: List[str]


class ReviewRequest(BaseModel):
    """Request payload for reviewing a raw research report."""
    report: str = Field(..., description="The complete raw research report to be reviewed.")


class ReviewResponse(BaseModel):
    """Response payload for the reviewed and polished report."""
    reviewed_report: str = Field(..., description="The final polished report.")
    grammar_score: int = Field(..., description="Score out of 100")
    readability_score: int = Field(..., description="Score out of 100")
    formatting_score: int = Field(..., description="Score out of 100")
    suggestions: List[str] = Field(..., description="List of improvement suggestions.")
    word_count: int = Field(..., description="Total word count of the reviewed report")
    character_count: int = Field(..., description="Total character count of the reviewed report")


class ExportRequest(BaseModel):
    """Request payload for exporting a reviewed report."""
    reviewed_report: str
    suggestions: List[str] = []
    grammar_score: int = 0
    readability_score: int = 0
    formatting_score: int = 0


class ErrorResponse(BaseModel):
    """Standardized error tracking schema."""
    error: str = Field(..., description="Error classification category.")
    detail: str = Field(..., description="Descriptive reasoning regarding the runtime failure event.")