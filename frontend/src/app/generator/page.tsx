"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function GeneratorPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SQLSchemaResponse | null>(null);
  const [selectedTableIndex, setSelectedTableIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const samplePrompts = [
    "E-commerce store with orders, items, inventory tracks and users.",
    "Blog site with users, posts, categories, comments and tags.",
    "Project board like Trello with boards, lists, cards, and member assignments."
  ];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setSelectedTableIndex(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error status ${res.status}`);
      }

      const data: SQLSchemaResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please check your backend.");
    } finally {
      setLoading(false);
    }
  }

  const selectedTable = response?.tables?.[selectedTableIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6] text-neutral-800 selection:bg-neutral-200 selection:text-black">
      {/* Soft Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <header className="border-b border-[#e5e5e5] bg-[#F4F5F6]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-neutral-500 hover:text-[#111111] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </Link>
            {/* Logo */}
            <span className="w-5 h-5 rounded bg-[#111111] flex items-center justify-center font-bold text-white text-xs tracking-tighter">
              S
            </span>
            <span className="font-display font-semibold tracking-tight text-[#111111] text-sm">
              SchemaAI
            </span>
          </div>
        </div>
      </header>

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
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((prompt, i) => (
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
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition-all flex items-center justify-between border ${
                    selectedTableIndex === i
                      ? "bg-[#5E6AD2]/5 text-[#5E6AD2] border-[#5E6AD2]/25 font-semibold"
                      : "bg-transparent hover:bg-neutral-50 border-transparent text-neutral-500"
                  }`}
                >
                  <span className="truncate">{table.table_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    selectedTableIndex === i ? "bg-[#5E6AD2]/10 text-[#5E6AD2]" : "bg-[#f4f5f6] text-neutral-400"
                  }`}>
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
                                    <span key={cIdx} className="bg-white border border-[#e5e5e5] text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase">
                                      {c}
                                    </span>
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
                  <div className="border border-[#e5e5e5] bg-white rounded-lg p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Schema Query (DDL)</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTable.create_table_sql || "");
                          setCopySuccess("schema");
                          setTimeout(() => setCopySuccess(null), 2000);
                        }}
                        className="text-[11px] font-medium text-neutral-500 hover:text-black bg-white border border-[#e5e5e5] hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {copySuccess === "schema" ? "Copied!" : "Copy DDL"}
                      </button>
                    </div>
                    <pre className="bg-[#fafbfb] border border-[#e5e5e5] rounded-md p-4 font-mono text-xs text-neutral-600 overflow-x-auto whitespace-pre">
                      {selectedTable.create_table_sql}
                    </pre>
                  </div>
                )}

                {selectedTable.inserts_sql && (
                  <div className="border border-[#e5e5e5] bg-white rounded-lg p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Seed Rows (DML)</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTable.inserts_sql || "");
                          setCopySuccess("inserts");
                          setTimeout(() => setCopySuccess(null), 2000);
                        }}
                        className="text-[11px] font-medium text-neutral-500 hover:text-black bg-white border border-[#e5e5e5] hover:bg-neutral-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {copySuccess === "inserts" ? "Copied!" : "Copy Seed SQL"}
                      </button>
                    </div>
                    <pre className="bg-[#fafbfb] border border-[#e5e5e5] rounded-md p-4 font-mono text-xs text-neutral-600 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {selectedTable.inserts_sql}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
