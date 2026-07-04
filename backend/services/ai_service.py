import asyncio
import os
import json
import httpx
from fastapi import HTTPException
from models.schema import SQLSchemaResponse

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}
MAX_RETRIES = 2

async def generate_schema_from_ai(description: str) -> SQLSchemaResponse:
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")
    
    system_prompt = (
        "You are a database design expert. Generate a database schema based on the user's description. "
        "You must respond with a JSON object that strictly adheres to this JSON schema:\n"
        f"{json.dumps(SQLSchemaResponse.model_json_schema())}\n"
        "Do not include any explanation, markdown formatting, or text outside the JSON object."
    )
    
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": description}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(MAX_RETRIES + 1):
            try:
                response = await client.post(GROQ_API_URL, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return SQLSchemaResponse.model_validate_json(content)
            except httpx.HTTPStatusError as e:
                if e.response.status_code in RETRYABLE_STATUS_CODES and attempt < MAX_RETRIES:
                    await asyncio.sleep(2 ** attempt)
                    continue
                raise HTTPException(status_code=e.response.status_code, detail=f"Groq API error: {e.response.text}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to generate schema: {str(e)}")
