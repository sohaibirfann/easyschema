from models.schema import TableSchema

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

def populate_sql_statements(schema_response: any) -> any:
    for table in schema_response.tables:
        table.create_table_sql = generate_create_table_sql(table)
        table.inserts_sql = generate_inserts_sql(table)
    return schema_response
