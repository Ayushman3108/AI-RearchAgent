from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from models.schemas import (
    ReportInputSchema,
    ReportOutputSchema,
    ResearchRequest,
    ResearchResponse,
    ReviewRequest,
    ReviewResponse,
)
from agents.analysis.analysis import AnalysisAgent
from agents.reviewer.reviewer import reviewer_agent
from agents.writer.writer import ReportWriterEngine
from utils import logger
from config import settings
import uvicorn

app = FastAPI(
    title="AI Research Agent API",
    description="A production-ready Research Agent for the AI Research -> Report Generator pipeline.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/frontend", StaticFiles(directory=str(frontend_dir), html=False), name="frontend")

agent = AnalysisAgent()
writer_engine = ReportWriterEngine()


def _build_research_response(topic: str, analysis_result: dict) -> ResearchResponse:
    """Map the analysis-agent payload to the frontend-friendly research response schema."""
    summary = analysis_result.get("summary", "")
    key_points = analysis_result.get("key_points") or []
    statistics = analysis_result.get("statistics") or []
    advantages = analysis_result.get("advantages") or []
    challenges = analysis_result.get("challenges") or []
    future_trends = analysis_result.get("future_trends") or []
    keywords = analysis_result.get("keywords") or []

    return ResearchResponse(
        topic=topic,
        overview=summary,
        key_concepts=list(key_points[:8]) if key_points else list(keywords[:8]),
        important_statistics=list(statistics[:8]) if statistics else [],
        current_trends=list(future_trends[:8]) if future_trends else [],
        applications=list(advantages[:8]) if advantages else [],
        advantages=list(advantages[:8]) if advantages else [],
        challenges=list(challenges[:8]) if challenges else [],
        future_scope=list(future_trends[:8]) if future_trends else [],
        references=list(keywords[:8]) if keywords else [],
    )


@app.get("/")
async def root():
    """Serve the frontend landing page for browser use."""
    return FileResponse(frontend_dir / "index.html")


@app.post("/analyze", status_code=200)
async def analyze_text(request: ResearchRequest):
    """
    Returns the raw analysis output for the Writer Agent.
    """
    try:
        if not request.topic or not request.topic.strip():
            raise HTTPException(status_code=422, detail="Topic cannot be empty.")

        analysis_result = agent.analyze_research(request.topic)

        return analysis_result

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/research", response_model=ResearchResponse, status_code=200)
async def research_text(request: ResearchRequest):
    """Compatibility endpoint for the dedicated research UI page."""
    return await _run_research(request)


@app.post("/review", response_model=ReviewResponse, status_code=200)
async def review_text(request: ReviewRequest):
    """Review a raw report and return the polished result plus scoring metadata."""
    try:
        result = reviewer_agent.review_report(request.report)
        return ReviewResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve)) from ve
    except Exception as exc:  # pragma: no cover - convert unexpected failures into HTTP 500
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(exc)}") from exc


@app.get("/health", tags=["Health Check"], status_code=status.HTTP_200_OK)
async def read_root():
    """Basic health check endpoint for the API."""
    return {"status": "Report Writer Agent API Running"}


@app.post(
    "/write-report",
    response_model=ReportOutputSchema,
    status_code=status.HTTP_200_OK,
    tags=["Report Generation"],
)
async def generate_report(payload: ReportInputSchema):
    """Create a simple markdown-style report from structured input."""
    logger.info("Received request payload processing authorization invocation.")
    try:
        result = writer_engine.process_and_write(payload)
        logger.info("Successfully synthesized academic document data payload blocks.")
        return result
    except ValueError as val_err:
        logger.error("Structured validation schema compliance divergence error: %s", val_err)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Data verification constraint conflict: {str(val_err)}",
        ) from val_err
    except Exception as general_err:
        logger.error("Unhandled operational failure event flagged: %s", general_err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing disruption encountered internally: {str(general_err)}",
        ) from general_err


async def _run_research(request: ResearchRequest) -> ResearchResponse:
    try:
        if not request.topic or not request.topic.strip():
            raise ValueError("The topic field cannot be empty.")

        research_result = agent.analyze_research(request.topic)
        return _build_research_response(request.topic, research_result)

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )