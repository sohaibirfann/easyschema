from fastapi import APIRouter
from models.schema import GenerateRequest, SQLSchemaResponse
from services.ai_service import generate_schema_from_ai
from services.sql_generator import populate_sql_statements

router = APIRouter(prefix="/api", tags=["schema"])

@router.post("/generate")
async def generate_schema(payload: GenerateRequest) -> SQLSchemaResponse:
    response = await generate_schema_from_ai(payload.description)
    return populate_sql_statements(response)
