"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { WarmUpPing } from "@/components/WarmUpPing";
import { PromptForm } from "@/components/PromptForm";
import { EmptyState, LoadingState, WakingState, ErrorState } from "@/components/ResultStates";
import { SchemaDiagram } from "@/components/SchemaDiagram";
import { TablesView, SqlPanel } from "@/components/TablesView";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { downloadText } from "@/lib/download";
import type { SQLSchemaResponse, Dialect, OrmTarget, HistoryEntry } from "@/types/schema";

const ORM_FILENAME: Record<Exclude<OrmTarget, "none">, string> = {
  prisma: "schema.prisma",
  sqlalchemy: "models.py",
};

function buildFullSchemaSql(response: SQLSchemaResponse): string {
  const ddl = response.tables.map(t => t.create_table_sql).filter(Boolean).join("\n\n");
  const dml = response.tables.map(t => t.inserts_sql).filter(Boolean).join("\n\n");
  return dml ? `${ddl}\n\n${dml}` : ddl;
}

const LS_KEY = "schemaai_history";

function readHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function writeHistory(h: HistoryEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(h.slice(0, 20)));
}

export default function GeneratorPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SQLSchemaResponse | null>(null);
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [slowWake, setSlowWake] = useState(false);
  const [view, setView] = useState<"tables" | "diagram">("tables");
  const [dialect, setDialect] = useState<Dialect>("postgres");
  const [ormTarget, setOrmTarget] = useState<OrmTarget>("none");
  const [responseOrm, setResponseOrm] = useState<OrmTarget>("none");

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setSelectedTableIndex(0);
    setActiveId(null);

    const wakeTimer = setTimeout(() => setSlowWake(true), 4500);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, dialect, orm: ormTarget }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server returned error status ${res.status}`);
      }

      const data: SQLSchemaResponse = await res.json();
      setResponse(data);
      setResponseOrm(ormTarget);

      const entry: HistoryEntry = { id: Date.now(), prompt: description.trim(), response: data, dialect, orm: ormTarget };
      const next = [entry, ...history].slice(0, 20);
      writeHistory(next);
      setHistory(next);
      setActiveId(entry.id);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please check your backend.");
    } finally {
      clearTimeout(wakeTimer);
      setSlowWake(false);
      setLoading(false);
    }
  }

  function loadEntry(entry: HistoryEntry) {
    setDescription(entry.prompt);
    setResponse(entry.response);
    setDialect(entry.dialect ?? "postgres");
    setOrmTarget(entry.orm ?? "none");
    setResponseOrm(entry.orm ?? "none");
    setSelectedTableIndex(0);
    setError(null);
    setActiveId(entry.id);
    setHistoryOpen(false);
  }

  function deleteEntry(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    const next = history.filter(h => h.id !== id);
    writeHistory(next);
    setHistory(next);
    if (activeId === id) setActiveId(null);
  }

  function handleCopy(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopySuccess(key);
    setTimeout(() => setCopySuccess(null), 2000);
  }

  const fkCount = response ? response.tables.reduce((n, t) => n + t.columns.filter(c => c.references).length, 0) : 0;

  return (
    <div className="relative h-screen flex flex-col bg-background text-ink overflow-hidden">
      <WarmUpPing />

      <header className="relative z-50 flex-none flex items-center justify-between px-6 py-3 bg-surface border-b border-[rgba(16,20,19,0.08)]">
        <div className="flex items-center gap-3.5">
          <Link href="/" aria-label="Back to home" className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-ink-soft hover:bg-[rgba(16,20,19,0.06)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
          <div className="flex items-center gap-[9px]">
            <span className="text-accent"><BrandMark size={24} /></span>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">EasySchema</span>
            <span className="font-mono text-[10.5px] text-ink-muted border border-[rgba(16,20,19,0.1)] px-[7px] py-0.5 rounded-[5px]">generator</span>
          </div>
        </div>

        <button
          onClick={() => setHistoryOpen(o => !o)}
          className={`flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-[7px] border transition-colors cursor-pointer ${historyOpen ? "bg-ink text-background border-ink" : "bg-surface text-ink-soft border-[rgba(16,20,19,0.12)] hover:bg-[rgba(16,20,19,0.03)]"}`}
        >
          history
          {history.length > 0 && (
            <span className={`text-[10.5px] px-1.5 py-px rounded-full ${historyOpen ? "bg-white text-ink" : "bg-accent text-white"}`}>
              {history.length}
            </span>
          )}
        </button>
      </header>

      <PromptForm
        description={description}
        setDescription={setDescription}
        dialect={dialect}
        setDialect={setDialect}
        ormTarget={ormTarget}
        setOrmTarget={setOrmTarget}
        loading={loading}
        onSubmit={handleGenerate}
      />

      {response ? (
        <>
          <div className="flex-none flex items-center justify-between px-6 py-3">
            <div className="flex bg-surface border border-[rgba(16,20,19,0.12)] rounded-lg p-[3px]">
              <button
                onClick={() => setView("tables")}
                className={`font-mono text-xs px-4 py-[5px] rounded-md transition-colors cursor-pointer ${view === "tables" ? "bg-ink text-background" : "text-ink-soft hover:text-ink"}`}
              >
                tables
              </button>
              <button
                onClick={() => setView("diagram")}
                className={`font-mono text-xs px-4 py-[5px] rounded-md transition-colors cursor-pointer ${view === "diagram" ? "bg-ink text-background" : "text-ink-soft hover:text-ink"}`}
              >
                diagram
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] text-accent hidden sm:inline">
                validated · {response.tables.length} tables · {fkCount} FKs
              </span>
              <button
                onClick={() => downloadText("schema.sql", buildFullSchemaSql(response))}
                className="flex items-center gap-[7px] font-mono text-xs text-background bg-accent px-3.5 py-[7px] rounded-[7px] hover:opacity-90 transition-opacity cursor-pointer"
              >
                ↓ schema.sql
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto px-6 pb-5">
            {view === "diagram" ? (
              <SchemaDiagram tables={response.tables} />
            ) : (
              <TablesView
                tables={response.tables}
                selectedIndex={selectedTableIndex}
                onSelect={setSelectedTableIndex}
                copySuccess={copySuccess}
                onCopy={handleCopy}
              />
            )}

            {response.orm_schema && (
              <div className="mt-3.5">
                <SqlPanel
                  filename={ORM_FILENAME[responseOrm as Exclude<OrmTarget, "none">]}
                  downloadName={ORM_FILENAME[responseOrm as Exclude<OrmTarget, "none">]}
                  sql={response.orm_schema}
                  copyKey="orm"
                  copySuccess={copySuccess}
                  onCopy={handleCopy}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto px-6 pt-5">
          <div className="max-w-[560px] mx-auto">
            {loading && slowWake ? (
              <WakingState />
            ) : loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => handleGenerate()} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      )}

      <HistoryDrawer
        open={historyOpen}
        history={history}
        activeId={activeId}
        onLoad={loadEntry}
        onDelete={deleteEntry}
        onClear={() => { writeHistory([]); setHistory([]); setActiveId(null); }}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
