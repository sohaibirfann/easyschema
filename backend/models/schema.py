from pydantic import BaseModel, Field

class Column(BaseModel):
    name: str = Field(description="Name of the column")
    type: str = Field(description="SQL data type")
    constraints: list[str] = Field(default_factory=list, description="SQL constraints")

class TableSchema(BaseModel):
    table_name: str = Field(description="Name of the table")
    columns: list[Column] = Field(description="Columns defined in the table")
    seed_inserts: list[str] = Field(default_factory=list, description="Seed INSERT SQL statements for this table")
    create_table_sql: str | None = Field(default=None, description="Generated CREATE TABLE SQL statement")
    inserts_sql: str | None = Field(default=None, description="Generated seed INSERT statements combined")

class SQLSchemaResponse(BaseModel):
    tables: list[TableSchema] = Field(description="Tables generated from user description")

class GenerateRequest(BaseModel):
    description: str = Field(description="Natural language description of the requested database schema")
