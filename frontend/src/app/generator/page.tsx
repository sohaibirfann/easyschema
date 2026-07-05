"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { WarmUpPing } from "@/components/WarmUpPing";
import { PromptForm } from "@/components/PromptForm";
import { EmptyState, LoadingState, WakingState, ErrorState } from "@/components/ResultStates";
import { SchemaDiagram } from "@/components/SchemaDiagram";
import { SqlHighlight } from "@/components/SqlHighlight";
import type { SQLSchemaResponse, Dialect } from "@/types/schema";
import { DIALECTS } from "@/types/schema";

function downloadText(filename: string, content: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildFullSchemaSql(response: SQLSchemaResponse): string {
  const ddl = response.tables.map(t => t.create_table_sql).filter(Boolean).join("\n\n");
  const dml = response.tables.map(t => t.inserts_sql).filter(Boolean).join("\n\n");
  return dml ? `${ddl}\n\n${dml}` : ddl;
}

interface HistoryEntry {
  id: number;
  prompt: string;
  response: SQLSchemaResponse;
  dialect: Dialect;
}

const LS_KEY = "schemaai_history";

function readHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function writeHistory(h: HistoryEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(h.slice(0, 20)));
}

function relativeTime(id: number) {
  const mins = Math.floor((Date.now() - id) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function HistoryDrawer({ open, history, activeId, onLoad, onDelete, onClear, onClose }: {
  open: boolean;
  history: HistoryEntry[];
  activeId: number | null;
  onLoad: (e: HistoryEntry) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white border-l border-[#e5e5e5] shadow-xl z-40 flex flex-col transition-transform duration-200 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Schema History</span>
          {history.length > 0 && (
            <button onClick={onClear} className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors cursor-pointer">
              Clear all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <p className="text-xs text-neutral-400">Generated schemas will appear here.</p>
            </div>
          ) : (
            <ul className="p-2 flex flex-col gap-1">
              {history.map(entry => (
                <li key={entry.id}>
                  <div
                    onClick={() => onLoad(entry)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onLoad(entry)}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-all group flex flex-col gap-1 border cursor-pointer ${activeId === entry.id ? "bg-[#5E6AD2]/5 border-[#5E6AD2]/20" : "bg-transparent border-transparent hover:bg-neutral-50"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-medium leading-snug line-clamp-2 flex-1 ${activeId === entry.id ? "text-[#5E6AD2]" : "text-neutral-700"}`}>
                        {entry.prompt}
                      </span>
                      <button onClick={(e) => onDelete(entry.id, e)} className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all shrink-0 mt-0.5 cursor-pointer" aria-label="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>{relativeTime(entry.id)}</span>
                      <span className="text-neutral-300">·</span>
                      <span>{entry.response.tables.length} table{entry.response.tables.length !== 1 ? "s" : ""}</span>
                      {entry.dialect && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span>{DIALECTS.find(d => d.value === entry.dialect)?.label ?? entry.dialect}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {open && <div className="fixed inset-0 z-30 top-16" onClick={onClose} />}
    </>
  );
}

function SqlPanel({ label, sql, copyKey, copySuccess, onCopy, wrap, filename }: {
  label: string;
  sql: string;
  copyKey: string;
  copySuccess: string | null;
  onCopy: (key: string, text: string) => void;
  wrap?: boolean;
  filename: string;
}) {
  return (
    <div className="border border-[#e5e5e5] bg-white rounded-lg p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadText(filename, sql)}
            className="text-[11px] font-medium text-neutral-500 hover:text-black bg-white border border-[#e5e5e5] hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            Download
          </button>
          <button
            onClick={() => onCopy(copyKey, sql)}
            className="text-[11px] font-medium text-neutral-500 hover:text-black bg-white border border-[#e5e5e5] hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            {copySuccess === copyKey ? "Copied!" : `Copy ${copyKey === "schema" ? "DDL" : "Seed SQL"}`}
          </button>
        </div>
      </div>
      <pre className={`bg-[#fafbfb] border border-[#e5e5e5] rounded-md p-4 font-mono text-xs text-neutral-600 overflow-x-auto ${wrap ? "whitespace-pre-wrap leading-relaxed" : "whitespace-pre"}`}>
        <SqlHighlight sql={sql} />
      </pre>
    </div>
  );
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
        body: JSON.stringify({ description, dialect }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server returned error status ${res.status}`);
      }

      const data: SQLSchemaResponse = await res.json();
      setResponse(data);

      const entry: HistoryEntry = { id: Date.now(), prompt: description.trim(), response: data, dialect };
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

  const selectedTable = response?.tables?.[selectedTableIndex];
  const fkCount = response ? response.tables.reduce((n, t) => n + t.columns.filter(c => c.references).length, 0) : 0;

  return (
    <div className="h-screen flex flex-col bg-background text-ink overflow-hidden">
      <WarmUpPing />

      <header className="flex-none flex items-center justify-between px-6 py-3 bg-surface border-b border-[rgba(16,20,19,0.08)]">
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
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:w-56 border border-[#e5e5e5] bg-white rounded-lg p-3 flex flex-col gap-1 shrink-0 shadow-sm">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider px-2 pb-2 border-b border-[#e5e5e5] mb-1.5">Schema Tables</span>
                  {response.tables.map((table, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTableIndex(i)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition-all flex items-center justify-between border ${selectedTableIndex === i ? "bg-[#5E6AD2]/5 text-[#5E6AD2] border-[#5E6AD2]/25 font-semibold" : "bg-transparent hover:bg-neutral-50 border-transparent text-neutral-500"}`}
                    >
                      <span className="truncate">{table.table_name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedTableIndex === i ? "bg-[#5E6AD2]/10 text-[#5E6AD2]" : "bg-[#f4f5f6] text-neutral-400"}`}>
                        {table.columns.length}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedTable && (
                  <div className="flex-1 w-full flex flex-col gap-6">
                    <div className="border border-[#e5e5e5] bg-white rounded-lg p-5 flex flex-col gap-4 shadow-sm">
                      <h2 className="font-display text-lg font-semibold text-[#111111] flex items-center gap-1.5">
                        <span className="text-neutral-400 font-normal">table:</span> {selectedTable.table_name}
                      </h2>

                      <div className="overflow-x-auto border border-[#e5e5e5] bg-[#F4F5F6]/30 rounded-md">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="border-b border-[#e5e5e5] text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                              <th className="px-4 py-2.5">Column</th>
                              <th className="px-4 py-2.5">Type</th>
                              <th className="px-4 py-2.5">Constraints</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e5e5e5]/80 text-[11px] text-neutral-700 font-mono">
                            {selectedTable.columns.map((col, idx) => (
                              <tr key={idx} className="hover:bg-neutral-50">
                                <td className="px-4 py-2.5 font-sans font-semibold text-neutral-800">{col.name}</td>
                                <td className="px-4 py-2.5 text-indigo-600 font-semibold">{col.type}</td>
                                <td className="px-4 py-2.5">
                                  {col.constraints.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 font-sans">
                                      {col.constraints.map((c, cIdx) => (
                                        <span key={cIdx} className="bg-white border border-[#e5e5e5] text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase">{c}</span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-neutral-400 font-sans">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {selectedTable.create_table_sql && (
                      <SqlPanel label="Schema Query (DDL)" sql={selectedTable.create_table_sql} copyKey="schema" copySuccess={copySuccess} onCopy={handleCopy} filename={`${selectedTable.table_name}_schema.sql`} />
                    )}
                    {selectedTable.inserts_sql && (
                      <SqlPanel label="Seed Rows (DML)" sql={selectedTable.inserts_sql} copyKey="inserts" copySuccess={copySuccess} onCopy={handleCopy} wrap filename={`${selectedTable.table_name}_seed.sql`} />
                    )}
                  </div>
                )}
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
