import json
from models import ResearchRequest, ResearchResponse
from services.openai_service import generate_research_data
from utils import clean_json_string

async def perform_research(request: ResearchRequest) -> ResearchResponse:
    """
    Core business logic: Calls the AI service, cleans the output, 
    parses the JSON, and validates it against the Pydantic schema.
    """
    # 1. Fetch raw data from the AI service
    raw_ai_response = await generate_research_data(request.topic)
    
    # 2. Clean the string (handle potential markdown formatting)
    cleaned_json_str = clean_json_string(raw_ai_response)
    
    # 3. Parse JSON safely
    try:
        parsed_data = json.loads(cleaned_json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON format: {str(e)}")
        
    # 4. Validate and construct the final response using Pydantic
    try:
        validated_response = ResearchResponse(**parsed_data)
        return validated_response
    except Exception as e:
        raise ValueError(f"AI response did not match required schema: {str(e)}")