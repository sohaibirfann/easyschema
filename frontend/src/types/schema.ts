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
  orm_schema: string | null;
}

export type Dialect = "postgres" | "mysql" | "sqlite";
export type OrmTarget = "none" | "prisma" | "sqlalchemy";

export interface HistoryEntry {
  id: number;
  prompt: string;
  response: SQLSchemaResponse;
  dialect: Dialect;
  orm: OrmTarget;
}

export const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
];

export const ORM_TARGETS: { value: OrmTarget; label: string }[] = [
  { value: "none", label: "No ORM" },
  { value: "prisma", label: "Prisma" },
  { value: "sqlalchemy", label: "SQLAlchemy" },
];
