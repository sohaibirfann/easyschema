from models.schema import Column, TableSchema

PRISMA_TYPES = {
    "INTEGER": "Int", "INT": "Int", "SMALLINT": "Int", "BIGINT": "BigInt",
    "VARCHAR": "String", "CHAR": "String", "TEXT": "String",
    "BOOLEAN": "Boolean", "BOOL": "Boolean",
    "TIMESTAMP": "DateTime", "DATETIME": "DateTime", "DATE": "DateTime", "TIME": "DateTime",
    "DECIMAL": "Decimal", "NUMERIC": "Decimal", "FLOAT": "Float", "DOUBLE": "Float", "REAL": "Float",
    "BLOB": "Bytes",
}

SQLALCHEMY_TYPES = {
    "INTEGER": "Integer", "INT": "Integer", "SMALLINT": "SmallInteger", "BIGINT": "BigInteger",
    "VARCHAR": "String", "CHAR": "String", "TEXT": "Text",
    "BOOLEAN": "Boolean", "BOOL": "Boolean",
    "TIMESTAMP": "DateTime", "DATETIME": "DateTime", "DATE": "Date", "TIME": "Time",
    "DECIMAL": "Numeric", "NUMERIC": "Numeric", "FLOAT": "Float", "DOUBLE": "Float", "REAL": "Float",
    "BLOB": "LargeBinary",
}

def _base_type(sql_type: str) -> str:
    return sql_type.split("(")[0].strip().upper()

def _pascal_case(name: str) -> str:
    return "".join(part.capitalize() for part in name.split("_"))

def _relation_field_name(column_name: str, referenced_table: str) -> str:
    return column_name[:-3] if column_name.endswith("_id") else referenced_table

def _has_default_now(col: Column) -> bool:
    return any(c.upper().replace(" ", "") == "DEFAULT NOW()".replace(" ", "") for c in col.constraints)

def _build_reverse_refs(tables: list[TableSchema]) -> dict[str, list[tuple[str, Column]]]:
    reverse: dict[str, list[tuple[str, Column]]] = {}
    for table in tables:
        for col in table.columns:
            if col.references:
                reverse.setdefault(col.references.table, []).append((table.table_name, col))
    return reverse

def _reverse_field_names(referencing: list[tuple[str, Column]]) -> dict[tuple[str, str], str]:
    seen_tables = [t for t, _ in referencing]
    names: dict[tuple[str, str], str] = {}
    for table_name, col in referencing:
        needs_suffix = seen_tables.count(table_name) > 1
        names[(table_name, col.name)] = f"{table_name}_via_{col.name}" if needs_suffix else table_name
    return names

def _pair_is_ambiguous(referencing_table: str, col: Column, reverse_refs: dict[str, list[tuple[str, Column]]]) -> bool:
    same_pair = [c for t, c in reverse_refs.get(col.references.table, []) if t == referencing_table]
    return len(same_pair) > 1

def _needs_named_relation(referencing_table: str, col: Column, reverse_refs: dict[str, list[tuple[str, Column]]]) -> bool:
    # prisma treats a relation as ambiguous when the same pair of models is linked
    # more than once, or when a model links to itself
    return col.references.table == referencing_table or _pair_is_ambiguous(referencing_table, col, reverse_refs)

def generate_prisma_schema(tables: list[TableSchema]) -> str:
    reverse_refs = _build_reverse_refs(tables)
    blocks = []

    for table in tables:
        lines = [f"model {table.table_name} {{"]
        for col in table.columns:
            is_pk = any(c.upper() == "PRIMARY KEY" for c in col.constraints)
            is_unique = any(c.upper() == "UNIQUE" for c in col.constraints)
            is_required = any(c.upper() == "NOT NULL" for c in col.constraints) or is_pk

            prisma_type = PRISMA_TYPES.get(_base_type(col.type), "String")
            if not is_required:
                prisma_type += "?"

            attrs = []
            if is_pk:
                attrs.append("@id")
                if col.auto_increment:
                    attrs.append("@default(autoincrement())")
            if is_unique:
                attrs.append("@unique")
            if _has_default_now(col):
                attrs.append("@default(now())")

            attr_str = f" {' '.join(attrs)}" if attrs else ""
            lines.append(f"  {col.name} {prisma_type}{attr_str}")

            if col.references:
                field_name = _relation_field_name(col.name, col.references.table)
                rel_type = col.references.table if is_required else f"{col.references.table}?"
                rel_args = f"fields: [{col.name}], references: [{col.references.column}]"
                if _needs_named_relation(table.table_name, col, reverse_refs):
                    rel_args = f'"{table.table_name}_{col.name}", {rel_args}'
                lines.append(f"  {field_name} {rel_type} @relation({rel_args})")

        if table.table_name in reverse_refs:
            back_names = _reverse_field_names(reverse_refs[table.table_name])
            for ref_table, ref_col in reverse_refs[table.table_name]:
                field_name = back_names[(ref_table, ref_col.name)]
                if _needs_named_relation(ref_table, ref_col, reverse_refs):
                    lines.append(f'  {field_name} {ref_table}[] @relation("{ref_table}_{ref_col.name}")')
                else:
                    lines.append(f"  {field_name} {ref_table}[]")

        lines.append("}")
        blocks.append("\n".join(lines))

    return "\n\n".join(blocks)

def generate_sqlalchemy_models(tables: list[TableSchema]) -> str:
    reverse_refs = _build_reverse_refs(tables)
    back_fields = {t: _reverse_field_names(refs) for t, refs in reverse_refs.items()}
    blocks = []

    for table in tables:
        class_name = _pascal_case(table.table_name)
        lines = [f"class {class_name}(Base):", f'    __tablename__ = "{table.table_name}"', ""]

        for col in table.columns:
            is_pk = any(c.upper() == "PRIMARY KEY" for c in col.constraints)
            is_unique = any(c.upper() == "UNIQUE" for c in col.constraints)
            is_not_null = any(c.upper() == "NOT NULL" for c in col.constraints)

            sa_type = SQLALCHEMY_TYPES.get(_base_type(col.type), "String")
            fk = f", ForeignKey('{col.references.table}.{col.references.column}')" if col.references else ""

            kwargs = []
            if is_pk:
                kwargs.append("primary_key=True")
                if col.auto_increment:
                    kwargs.append("autoincrement=True")
            if is_unique:
                kwargs.append("unique=True")
            if is_not_null and not is_pk:
                kwargs.append("nullable=False")
            if _has_default_now(col):
                kwargs.append("server_default=func.now()")

            kwarg_str = f", {', '.join(kwargs)}" if kwargs else ""
            lines.append(f"    {col.name} = Column({sa_type}{fk}{kwarg_str})")

            if col.references:
                field_name = _relation_field_name(col.name, col.references.table)
                back_name = back_fields[col.references.table][(table.table_name, col.name)]
                extras = ""
                if _pair_is_ambiguous(table.table_name, col, reverse_refs):
                    extras += f', foreign_keys="[{class_name}.{col.name}]"'
                if col.references.table == table.table_name:
                    # self-referential many-to-one needs remote_side or the mapper can't pick a direction
                    extras += f', remote_side="{_pascal_case(col.references.table)}.{col.references.column}"'
                lines.append(f'    {field_name} = relationship("{_pascal_case(col.references.table)}", back_populates="{back_name}"{extras})')

        if table.table_name in reverse_refs:
            back_names = _reverse_field_names(reverse_refs[table.table_name])
            for ref_table, ref_col in reverse_refs[table.table_name]:
                field_name = back_names[(ref_table, ref_col.name)]
                fk = f', foreign_keys="[{_pascal_case(ref_table)}.{ref_col.name}]"' if _pair_is_ambiguous(ref_table, ref_col, reverse_refs) else ""
                lines.append(f'    {field_name} = relationship("{_pascal_case(ref_table)}", back_populates="{_relation_field_name(ref_col.name, table.table_name)}"{fk})')

        blocks.append("\n".join(lines))

    header = (
        "from sqlalchemy import Column, Integer, BigInteger, SmallInteger, String, Text, Boolean, "
        "DateTime, Date, Time, Numeric, Float, LargeBinary, ForeignKey, func\n"
        "from sqlalchemy.orm import declarative_base, relationship\n\n"
        "Base = declarative_base()\n\n\n"
    )
    return header + "\n\n\n".join(blocks)

def generate_orm_schema(tables: list[TableSchema], target: str) -> str | None:
    if target == "prisma":
        return generate_prisma_schema(tables)
    if target == "sqlalchemy":
        return generate_sqlalchemy_models(tables)
    return None
