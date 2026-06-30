import asyncio
from unittest.mock import AsyncMock, patch
import os
os.environ["GROQ_API_KEY"] = "mock_key"

from services.ai_service import generate_schema_from_ai

class MockResponse:
    def __init__(self, status_code, json_data):
        self.status_code = status_code
        self.json_data = json_data

    def raise_for_status(self):
        pass

    def json(self):
        return self.json_data

async def test_generate():
    mock_response_content = """{
        "tables": [
            {
                "table_name": "users",
                "columns": [
                    {"name": "id", "type": "INTEGER", "constraints": ["PRIMARY KEY"]},
                    {"name": "name", "type": "VARCHAR(255)", "constraints": ["NOT NULL"]}
                ],
                "seed_inserts": [
                    "INSERT INTO users (id, name) VALUES (1, 'Alice');"
                ]
            }
        ]
    }"""
    
    mock_result = {
        "choices": [
            {
                "message": {
                    "content": mock_response_content
                }
            }
        ]
    }
    
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = MockResponse(200, mock_result)
        
        result = await generate_schema_from_ai("User table with id and name")
        assert len(result.tables) == 1
        assert result.tables[0].table_name == "users"
        assert result.tables[0].columns[0].name == "id"
        print("Test passed successfully!")

if __name__ == "__main__":
    asyncio.run(test_generate())
