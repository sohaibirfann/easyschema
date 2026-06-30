import os
import json
import httpx
from fastapi import HTTPException
from models.schema import SQLSchemaResponse

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async def generate_schema_from_ai(description: str) -> SQLSchemaResponse:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")
    
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    system_prompt = (
        "You are a database design expert. Generate a database schema based on the user's description. "
        "You must respond with a JSON object that strictly adheres to this JSON schema:\n"
        f"{json.dumps(SQLSchemaResponse.model_json_schema())}\n"
        "Do not include any explanation, markdown formatting, or text outside the JSON object."
    )
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": description}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            return SQLSchemaResponse.model_validate_json(content)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=response.status_code, detail=f"Groq API error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate schema: {str(e)}")
