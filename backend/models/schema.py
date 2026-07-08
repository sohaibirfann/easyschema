from typing import Literal
from pydantic import BaseModel, Field

class Reference(BaseModel):
    table: str = Field(description="Name of the referenced table")
    column: str = Field(description="Name of the referenced column")

class Column(BaseModel):
    name: str = Field(description="Name of the column")
    type: str = Field(description="SQL data type")
    constraints: list[str] = Field(default_factory=list, description="SQL constraints")
    references: Reference | None = Field(default=None, description="Foreign key reference, if this column is a foreign key")
    auto_increment: bool = Field(default=False, description="True if this is an auto-incrementing integer primary key")

class TableSchema(BaseModel):
    table_name: str = Field(description="Name of the table")
    columns: list[Column] = Field(description="Columns defined in the table")
    seed_inserts: list[str] = Field(default_factory=list, description="Seed INSERT SQL statements for this table")
    create_table_sql: str | None = Field(default=None, description="Generated CREATE TABLE SQL statement")
    inserts_sql: str | None = Field(default=None, description="Generated seed INSERT statements combined")

class SQLSchemaResponse(BaseModel):
    tables: list[TableSchema] = Field(description="Tables generated from user description")
    orm_schema: str | None = Field(default=None, description="Generated ORM model definitions, if an ORM target was requested")

class GenerateRequest(BaseModel):
    description: str = Field(description="Natural language description of the requested database schema")
    dialect: Literal["postgres", "mysql", "sqlite"] = Field(default="postgres", description="Target SQL dialect")
    orm: Literal["none", "prisma", "sqlalchemy"] = Field(default="none", description="Optional ORM target to also generate model definitions for")
