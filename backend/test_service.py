import asyncio
from unittest.mock import AsyncMock, patch
import os
os.environ["GROQ_API_KEY"] = "mock_key"

import httpx
from fastapi import HTTPException
from models.schema import Column, SQLSchemaResponse, TableSchema
from services.ai_service import generate_schema_from_ai
from services.sql_generator import populate_sql_statements

class MockResponse:
    def __init__(self, status_code, json_data=None, text=""):
        self.status_code = status_code
        self.json_data = json_data
        self.text = text

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("error", request=None, response=self)

    def json(self):
        return self.json_data

GOOD_CONTENT = """{
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
GOOD_RESULT = {"choices": [{"message": {"content": GOOD_CONTENT}}]}

def make_table(name, col_names):
    return TableSchema(table_name=name, columns=[Column(name=c, type="INTEGER") for c in col_names])

def test_generate_happy_path():
    async def run():
        with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=MockResponse(200, GOOD_RESULT))):
            result = await generate_schema_from_ai("User table with id and name")
            assert len(result.tables) == 1
            assert result.tables[0].table_name == "users"
            assert result.tables[0].columns[0].name == "id"

            populated = populate_sql_statements(result)
            assert "CREATE TABLE users" in populated.tables[0].create_table_sql
            assert "id INTEGER PRIMARY KEY" in populated.tables[0].create_table_sql
            assert "name VARCHAR(255) NOT NULL" in populated.tables[0].create_table_sql
            assert "INSERT INTO users" in populated.tables[0].inserts_sql

    asyncio.run(run())

def test_generate_fails_after_persistent_groq_error():
    async def run():
        with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=MockResponse(500, text="server error"))):
            with patch("asyncio.sleep", new=AsyncMock()):
                try:
                    await generate_schema_from_ai("User table with id and name")
                    assert False, "expected HTTPException"
                except HTTPException as e:
                    assert e.status_code == 500

    asyncio.run(run())

def test_populate_rejects_duplicate_table_names():
    schema = SQLSchemaResponse(tables=[make_table("users", ["id"]), make_table("users", ["id"])])
    try:
        populate_sql_statements(schema)
        assert False, "expected HTTPException"
    except HTTPException as e:
        assert e.status_code == 422

def test_populate_rejects_duplicate_column_names():
    schema = SQLSchemaResponse(tables=[make_table("users", ["id", "id", "name"])])
    try:
        populate_sql_statements(schema)
        assert False, "expected HTTPException"
    except HTTPException as e:
        assert e.status_code == 422

def test_autoincrement_renders_per_dialect():
    def schema():
        return SQLSchemaResponse(tables=[TableSchema(table_name="users", columns=[
            Column(name="id", type="INTEGER", constraints=["PRIMARY KEY"], auto_increment=True),
        ])])

    expected = {
        "postgres": "id SERIAL PRIMARY KEY",
        "mysql": "id INT AUTO_INCREMENT PRIMARY KEY",
        "sqlite": "id INTEGER PRIMARY KEY AUTOINCREMENT",
    }
    for dialect, phrase in expected.items():
        sql = populate_sql_statements(schema(), dialect).tables[0].create_table_sql
        assert phrase in sql, f"{dialect}: expected {phrase!r} in {sql!r}"
