from fastapi import HTTPException
from models.schema import TableSchema, SQLSchemaResponse

def validate_schema(schema_response: SQLSchemaResponse) -> None:
    table_names = [t.table_name for t in schema_response.tables]
    dupe_tables = {n for n in table_names if table_names.count(n) > 1}
    if dupe_tables:
        raise HTTPException(status_code=422, detail=f"Duplicate table name(s): {', '.join(sorted(dupe_tables))}")

    for table in schema_response.tables:
        col_names = [c.name for c in table.columns]
        dupe_cols = {n for n in col_names if col_names.count(n) > 1}
        if dupe_cols:
            raise HTTPException(status_code=422, detail=f"Table '{table.table_name}' has duplicate column name(s): {', '.join(sorted(dupe_cols))}")

def generate_create_table_sql(table: TableSchema) -> str:
    lines = []
    for col in table.columns:
        col_line = f"    {col.name} {col.type}"
        if col.constraints:
            col_line += " " + " ".join(col.constraints)
        lines.append(col_line)
    
    columns_str = ",\n".join(lines)
    return f"CREATE TABLE {table.table_name} (\n{columns_str}\n);"

def generate_inserts_sql(table: TableSchema) -> str:
    if not table.seed_inserts:
        return ""
    return "\n".join(table.seed_inserts)

def populate_sql_statements(schema_response: SQLSchemaResponse) -> SQLSchemaResponse:
    validate_schema(schema_response)
    for table in schema_response.tables:
        table.create_table_sql = generate_create_table_sql(table)
        table.inserts_sql = generate_inserts_sql(table)
    return schema_response
