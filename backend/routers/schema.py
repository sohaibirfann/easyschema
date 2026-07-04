import time
from collections import defaultdict
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from models.schema import GenerateRequest, SQLSchemaResponse
from services.ai_service import generate_schema_from_ai
from services.sql_generator import populate_sql_statements

router = APIRouter(prefix="/api", tags=["schema"])

RATE_LIMIT = 5
RATE_WINDOW_SECONDS = 60
_hits: dict[str, list[float]] = defaultdict(list)

# just an in-memory counter, resets on restart - fine since we're on a single free instance
def check_rate_limit(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    hits = _hits[ip]
    hits[:] = [t for t in hits if now - t < RATE_WINDOW_SECONDS]
    if len(hits) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment and try again.")
    hits.append(now)

RateLimitDep = Annotated[None, Depends(check_rate_limit)]

@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

@router.post("/generate")
async def generate_schema(payload: GenerateRequest, _: RateLimitDep) -> SQLSchemaResponse:
    response = await generate_schema_from_ai(payload.description)
    return populate_sql_statements(response, payload.dialect)
