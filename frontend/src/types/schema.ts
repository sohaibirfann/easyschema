export interface Reference {
  table: string;
  column: string;
}

export interface Column {
  name: string;
  type: string;
  constraints: string[];
  references: Reference | null;
}

export interface TableSchema {
  table_name: string;
  columns: Column[];
  seed_inserts: string[];
  create_table_sql: string | null;
  inserts_sql: string | null;
}

export interface SQLSchemaResponse {
  tables: TableSchema[];
}

export type Dialect = "postgres" | "mysql" | "sqlite";

export const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
];
