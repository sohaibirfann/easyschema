from fastapi import APIRouter
from models.schema import GenerateRequest, SQLSchemaResponse

router = APIRouter(prefix="/api", tags=["schema"])

@router.post("/generate")
async def generate_schema(payload: GenerateRequest) -> SQLSchemaResponse:
    return SQLSchemaResponse(tables=[])
