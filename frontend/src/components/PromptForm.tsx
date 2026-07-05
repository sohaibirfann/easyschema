import type { Dialect } from "@/types/schema";
import { DIALECTS } from "@/types/schema";

const PRESETS = [
  { label: "e-commerce", prompt: "E-commerce store with orders, items, inventory tracks and users." },
  { label: "blog", prompt: "Blog site with users, posts, categories, comments and tags." },
  { label: "kanban board", prompt: "Project board like Trello with boards, lists, cards, and member assignments." },
];

export function PromptForm({ description, setDescription, dialect, setDialect, loading, onSubmit }: {
  description: string;
  setDescription: (v: string) => void;
  dialect: Dialect;
  setDialect: (d: Dialect) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="flex-none px-6 pt-4 pb-3.5 border-b border-[rgba(16,20,19,0.08)] bg-surface">
      <form onSubmit={onSubmit}>
        <div className="flex gap-2.5 items-stretch">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your schema structure, tables, and relationships in plain English…"
            disabled={loading}
            className="flex-1 h-[44px] border border-[rgba(16,20,19,0.14)] rounded-[9px] px-[15px] py-[11px] bg-background font-mono text-[13px] text-ink placeholder:text-ink-muted resize-none outline-none focus:border-accent/50 transition-colors"
          />
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            disabled={loading}
            aria-label="SQL dialect"
            className="border border-[rgba(16,20,19,0.14)] rounded-[9px] px-3.5 bg-surface font-mono text-xs text-ink outline-none focus:border-accent/50 cursor-pointer disabled:text-ink-muted transition-colors"
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="flex items-center bg-ink text-background rounded-[9px] px-[22px] text-[13.5px] font-medium whitespace-nowrap hover:bg-[#222826] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {loading ? "Compiling…" : "Generate SQL"}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2.5 gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDescription(p.prompt)}
                disabled={loading}
                className="font-mono text-[11px] text-ink-soft border border-[rgba(16,20,19,0.1)] px-2.5 py-1 rounded-full bg-background hover:bg-[rgba(16,20,19,0.03)] transition-colors cursor-pointer disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[10.5px] text-ink-muted whitespace-nowrap hidden sm:inline">
            hosted free — first request may take a few seconds to wake the server
          </span>
        </div>
      </form>
    </div>
  );
}
