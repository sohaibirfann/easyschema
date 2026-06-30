from fastapi import APIRouter
from models.schema import GenerateRequest, SQLSchemaResponse
from services.ai_service import generate_schema_from_ai

router = APIRouter(prefix="/api", tags=["schema"])

@router.post("/generate")
async def generate_schema(payload: GenerateRequest) -> SQLSchemaResponse:
    return await generate_schema_from_ai(payload.description)
