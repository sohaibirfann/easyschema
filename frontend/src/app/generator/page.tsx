"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WakingUpNotice } from "@/components/WakingUpNotice";

interface Column {
  name: string;
  type: string;
  constraints: string[];
}

interface TableSchema {
  table_name: string;
  columns: Column[];
  seed_inserts: string[];
  create_table_sql: string | null;
  inserts_sql: string | null;
}

interface SQLSchemaResponse {
  tables: TableSchema[];
}

interface HistoryEntry {
  id: number;
  prompt: string;
  response: SQLSchemaResponse;
}

const LS_KEY = "schemaai_history";

const SAMPLE_PROMPTS = [
  "E-commerce store with orders, items, inventory tracks and users.",
  "Blog site with users, posts, categories, comments and tags.",
  "Project board like Trello with boards, lists, cards, and member assignments.",
];

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

// fallow-ignore-next-line complexity
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>{relativeTime(entry.id)}</span>
                      <span className="text-neutral-300">·</span>
                      <span>{entry.response.tables.length} table{entry.response.tables.length !== 1 ? "s" : ""}</span>
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
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([sql], { type: "text/plain" }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="border border-[#e5e5e5] bg-white rounded-lg p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={download}
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
        {sql}
      </pre>
    </div>
  );
}

// fallow-ignore-next-line complexity
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

  useEffect(() => {
    setHistory(readHistory());
    fetch("/api/health").catch(() => {});
  }, []);

  // fallow-ignore-next-line complexity
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
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
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server returned error status ${res.status}`);
      }

      const data: SQLSchemaResponse = await res.json();
      setResponse(data);

      const entry: HistoryEntry = { id: Date.now(), prompt: description.trim(), response: data };
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6] text-neutral-800 selection:bg-neutral-200 selection:text-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <header className="border-b border-[#e5e5e5] bg-[#F4F5F6]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-500 hover:text-[#111111] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </Link>
            <span className="w-5 h-5 rounded bg-[#111111] flex items-center justify-center font-bold text-white text-xs tracking-tighter">S</span>
            <span className="font-display font-semibold tracking-tight text-[#111111] text-sm">SchemaAI</span>
          </div>

          <button
            id="history-toggle"
            onClick={() => setHistoryOpen(o => !o)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${historyOpen ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-neutral-600 border-[#e5e5e5] hover:bg-neutral-50 hover:text-black"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            History
            {history.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${historyOpen ? "bg-white/20 text-white" : "bg-[#5E6AD2]/10 text-[#5E6AD2]"}`}>
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <HistoryDrawer
        open={historyOpen}
        history={history}
        activeId={activeId}
        onLoad={loadEntry}
        onDelete={deleteEntry}
        onClear={() => { writeHistory([]); setHistory([]); setActiveId(null); }}
        onClose={() => setHistoryOpen(false)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">
        <section className="flex flex-col gap-4 border border-[#e5e5e5] bg-white rounded-lg p-5 shadow-sm">
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="prompt-input" className="font-display text-xs font-semibold tracking-tight text-neutral-700">
                Design Schema Prompts
              </label>
              <textarea
                id="prompt-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your schema structure, tables, and relationships in plain English..."
                className="w-full h-24 bg-[#F4F5F6] border border-[#e5e5e5] focus:border-[#5E6AD2]/50 focus:ring-1 focus:ring-[#5E6AD2]/30 outline-none rounded-lg p-3.5 text-sm font-sans text-neutral-800 placeholder-neutral-400 transition-all resize-none"
                disabled={loading}
              />
              <WakingUpNotice />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDescription(prompt)}
                    className="text-xs text-neutral-600 hover:text-black bg-white border border-[#e5e5e5] hover:bg-neutral-50 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    Preset {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors rounded-md tracking-tight cursor-pointer"
              >
                {loading ? "Compiling..." : "Generate SQL"}
              </button>
            </div>
          </form>
        </section>

        {loading && slowWake && <WakingUpNotice active />}

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 text-xs font-sans flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div className="flex flex-col gap-1">
              <span className="font-semibold uppercase tracking-wider">Compilation Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {!response && !loading && !error && (
          <div className="border border-dashed border-[#e5e5e5] bg-white rounded-lg p-16 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#F4F5F6] border border-[#e5e5e5] flex items-center justify-center text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="font-display text-sm font-semibold text-neutral-700 uppercase tracking-tight">Console Empty</h3>
            <p className="font-sans text-xs text-neutral-400 max-w-sm leading-relaxed">
              Input database specifications above to generate schemas and SQL inserts.
            </p>
          </div>
        )}

        {response && (
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
      </main>
    </div>
  );
}
