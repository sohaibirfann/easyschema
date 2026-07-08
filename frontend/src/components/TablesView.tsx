import { SqlHighlight } from "@/components/SqlHighlight";
import { downloadText } from "@/lib/download";
import type { TableSchema, Column } from "@/types/schema";

function ConstraintTags({ col }: { col: Column }) {
  const base = "text-[10px] px-[7px] py-0.5 rounded-[4px]";
  return (
    <span className="flex flex-wrap gap-[5px]">
      {col.references && (
        <span className={`${base} text-amber bg-amber/10`}>FK → {col.references.table}.{col.references.column}</span>
      )}
      {col.constraints.map((c, i) => (
        <span key={i} className={`${base} ${c === "PRIMARY KEY" ? "text-accent bg-accent/[0.09]" : "text-ink-soft bg-[rgba(16,20,19,0.06)]"}`}>{c}</span>
      ))}
    </span>
  );
}

export function SqlPanel({ filename, downloadName, sql, copyKey, copySuccess, onCopy, wrap }: {
  filename: string;
  downloadName: string;
  sql: string;
  copyKey: string;
  copySuccess: string | null;
  onCopy: (key: string, text: string) => void;
  wrap?: boolean;
}) {
  return (
    <div className="bg-code-bg rounded-[11px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-[15px] py-[9px] border-b border-white/[0.07]">
        <span className="font-mono text-[11px] text-code-muted">{filename}</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onCopy(copyKey, sql)}
            className="font-mono text-[10.5px] text-code-text bg-white/[0.09] px-[9px] py-[3px] rounded-[5px] hover:bg-white/[0.15] transition-colors cursor-pointer"
          >
            {copySuccess === copyKey ? "copied" : "copy"}
          </button>
          <button
            onClick={() => downloadText(downloadName, sql)}
            aria-label="Download"
            className="font-mono text-[10.5px] text-code-text bg-white/[0.09] px-[9px] py-[3px] rounded-[5px] hover:bg-white/[0.15] transition-colors cursor-pointer"
          >
            ↓
          </button>
        </div>
      </div>
      <div className={`px-4 py-3.5 font-mono text-[11.5px] leading-[1.8] text-code-punct overflow-x-auto ${wrap ? "whitespace-pre-wrap" : "whitespace-pre"}`}>
        <SqlHighlight sql={sql} />
      </div>
    </div>
  );
}

export function TablesView({ tables, selectedIndex, onSelect, copySuccess, onCopy }: {
  tables: TableSchema[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  copySuccess: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const table = tables[selectedIndex] ?? tables[0];
  const fkCount = table.columns.filter(c => c.references).length;

  const panels = [
    table.create_table_sql && { copyKey: "schema", filename: "create_table.sql", downloadName: `${table.table_name}_schema.sql`, sql: table.create_table_sql, wrap: false },
    table.inserts_sql && { copyKey: "inserts", filename: "seed_inserts.sql", downloadName: `${table.table_name}_seed.sql`, sql: table.inserts_sql, wrap: true },
  ].filter(Boolean) as { copyKey: string; filename: string; downloadName: string; sql: string; wrap: boolean }[];

  return (
    <div className="flex flex-col lg:flex-row gap-3.5 items-start">
      <div className="w-full lg:w-56 shrink-0 bg-surface border border-[rgba(16,20,19,0.1)] rounded-[11px] p-2 flex flex-col gap-[3px]">
        {tables.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`flex items-center justify-between font-mono text-xs px-3 py-[9px] rounded-[7px] transition-colors cursor-pointer ${i === selectedIndex ? "bg-accent/[0.09] text-ink font-medium" : "text-ink-soft hover:bg-[rgba(16,20,19,0.03)]"}`}
          >
            <span className="truncate">{t.table_name}</span>
            <span className={`text-[10.5px] ${i === selectedIndex ? "text-accent" : "text-ink-muted"}`}>{t.columns.length}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0 w-full flex flex-col gap-3.5">
        <div className="bg-surface border border-[rgba(16,20,19,0.1)] rounded-[11px] overflow-hidden">
          <div className="flex items-center justify-between px-[18px] py-3 border-b border-[rgba(16,20,19,0.08)]">
            <span className="text-base font-semibold tracking-[-0.01em]">{table.table_name}</span>
            <span className="font-mono text-[10.5px] text-ink-muted">
              {table.columns.length} columns · {fkCount} foreign key{fkCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-[1.2fr_1fr_1.6fr] font-mono text-[11px] text-ink-muted px-[18px] py-2 border-b border-[rgba(16,20,19,0.07)]">
            <span>column</span><span>type</span><span>constraints</span>
          </div>
          {table.columns.map((col, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.2fr_1fr_1.6fr] items-center font-mono text-xs px-[18px] py-2 border-b border-[rgba(16,20,19,0.05)] last:border-b-0"
            >
              <span className="text-ink truncate">{col.name}</span>
              <span className="text-amber">{col.type}</span>
              <ConstraintTags col={col} />
            </div>
          ))}
        </div>

        <div className={`grid gap-3.5 ${panels.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
          {panels.map((p) => (
            <SqlPanel key={p.copyKey} {...p} copySuccess={copySuccess} onCopy={onCopy} />
          ))}
        </div>
      </div>
    </div>
  );
}
