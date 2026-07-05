import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { WarmUpPing } from "@/components/WarmUpPing";

const REPO_URL = "https://github.com/sohaibirfann/easyschema";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-ink">
      <WarmUpPing />

      {/* header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 py-[14px] bg-[rgba(248,250,249,0.92)] backdrop-blur-[8px] border-b border-[rgba(16,20,19,0.08)]">
        <div className="flex items-center gap-2.5">
          <span className="text-accent"><BrandMark /></span>
          <span className="text-base font-semibold tracking-[-0.01em]">EasySchema</span>
        </div>
        <div className="flex items-center gap-[22px]">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-mono text-xs text-ink-soft hover:text-ink transition-colors">github</a>
          <Link href="/generator" className="text-[13.5px] font-medium text-background bg-accent px-4 py-[7px] rounded-[7px] hover:opacity-90 transition-opacity">
            Launch app →
          </Link>
        </div>
      </header>

      {/* hero */}
      <section
        className="flex flex-col items-center text-center px-10 pt-[88px] pb-24"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,143,126,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(14,143,126,.05) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      >
        <h1 className="text-[60px] font-semibold tracking-[-0.03em] leading-[1.06] max-w-[720px]">
          Describe it.<br />We draw the database.
        </h1>
        <p className="mt-[22px] text-[17px] leading-[1.6] text-ink-soft max-w-[520px] text-pretty">
          Plain-English specs become validated tables, foreign keys, seed inserts and a live ER diagram — exportable in three SQL dialects.
        </p>
        <div className="flex items-center gap-4 mt-8">
          <Link href="/generator" className="text-[14.5px] font-medium text-background bg-ink px-[26px] py-3 rounded-lg hover:bg-[#222826] transition-colors">
            Start designing
          </Link>
          <a href="#specs" className="font-mono text-[13px] text-ink border-b-[1.5px] border-[rgba(16,20,19,0.3)] pb-0.5 hover:border-ink transition-colors">
            read the specs
          </a>
        </div>
      </section>

      {/* type a sentence, get a schema (animated mini generator) */}
      <section className="border-t border-[rgba(16,20,19,0.08)] px-10 pt-[72px] pb-20 bg-surface">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2">Type a sentence. Get a schema.</h2>
          <p className="text-[15px] text-ink-soft max-w-[560px] mb-8">
            Watch a plain-English prompt compile into validated tables and ready-to-run SQL.
          </p>

          <div className="bg-background border border-[rgba(16,20,19,0.1)] rounded-[14px] shadow-[0_18px_44px_-22px_rgba(16,20,19,0.18)] overflow-hidden">
            {/* prompt bar */}
            <div className="px-[18px] py-[14px] border-b border-[rgba(16,20,19,0.08)] bg-surface">
              <div className="flex gap-[9px] items-stretch">
                <div className="flex-1 flex items-center border border-[rgba(16,20,19,0.14)] rounded-[9px] px-[14px] py-2.5 bg-background overflow-hidden">
                  <span className="inline-block overflow-hidden whitespace-nowrap font-mono text-[13px] text-ink" style={{ animation: "es-type 9s steps(46) infinite" }}>
                    E-commerce store with orders, items and users
                  </span>
                  <span className="flex-none inline-block w-[7px] h-[15px] bg-accent ml-[3px]" style={{ animation: "es-caret 1s infinite" }} />
                </div>
                <div className="flex items-center gap-[7px] border border-[rgba(16,20,19,0.14)] rounded-[9px] px-[13px] bg-surface font-mono text-xs text-ink">
                  PostgreSQL <span className="text-ink-muted text-[10px]">▾</span>
                </div>
                <div className="flex items-center bg-ink text-background rounded-[9px] px-5 text-[13px] font-medium">Generate SQL</div>
              </div>
            </div>

            {/* toolbar */}
            <div className="flex items-center justify-between px-[18px] py-2.5">
              <div className="flex bg-surface border border-[rgba(16,20,19,0.12)] rounded-lg p-[3px]">
                <span className="font-mono text-[11.5px] text-background bg-ink px-3.5 py-1 rounded-md">tables</span>
                <span className="font-mono text-[11.5px] text-ink-soft px-3.5 py-1">diagram</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "es-dot 9s infinite" }} />
                <span style={{ animation: "es-dot 9s infinite" }}>validated · 4 tables · 3 FKs resolved</span>
              </div>
            </div>

            {/* body */}
            <div className="grid grid-cols-[200px_1fr] gap-3 px-[18px] pb-[18px]">
              <div className="bg-surface border border-[rgba(16,20,19,0.1)] rounded-[10px] p-[7px] flex flex-col gap-[3px]">
                {[
                  { name: "users", count: 4, active: false, delay: "0s" },
                  { name: "products", count: 5, active: false, delay: ".25s" },
                  { name: "orders", count: 4, active: true, delay: ".5s" },
                  { name: "order_items", count: 5, active: false, delay: ".75s" },
                ].map((t) => (
                  <div
                    key={t.name}
                    className={`flex items-center justify-between font-mono text-[11.5px] px-[11px] py-2 rounded-md ${t.active ? "bg-accent/[0.09] text-ink font-medium" : "text-ink-soft"}`}
                    style={{ animation: `es-pop 9s infinite`, animationDelay: t.delay }}
                  >
                    <span>{t.name}</span>
                    <span className={`text-[10px] ${t.active ? "text-accent" : "text-ink-muted"}`}>{t.count}</span>
                  </div>
                ))}
              </div>

              <div className="bg-code-bg rounded-[10px] overflow-hidden">
                <div className="flex items-center justify-between px-[14px] py-[9px] border-b border-white/[0.07]">
                  <span className="font-mono text-[11px] text-code-muted">orders · create_table.sql</span>
                  <div className="flex gap-1.5">
                    <span className="font-mono text-[10.5px] text-code-text bg-white/[0.09] px-[9px] py-[3px] rounded-[5px]">copy</span>
                    <span className="font-mono text-[10.5px] text-code-text bg-white/[0.09] px-[9px] py-[3px] rounded-[5px]">↓</span>
                  </div>
                </div>
                <div className="px-[18px] py-4 font-mono text-xs leading-[1.85]">
                  {[
                    { d: "0s", nodes: <><span className="text-code-keyword">CREATE TABLE</span> <span className="text-code-text">orders</span> <span className="text-code-punct">(</span></> },
                    { d: ".15s", nodes: <>&nbsp;&nbsp;<span className="text-code-text">id</span> <span className="text-code-type">SERIAL</span> <span className="text-code-keyword">PRIMARY KEY</span><span className="text-code-punct">,</span></> },
                    { d: ".3s", nodes: <>&nbsp;&nbsp;<span className="text-code-text">user_id</span> <span className="text-code-type">INT</span> <span className="text-code-keyword">REFERENCES</span> <span className="text-code-text">users(id)</span><span className="text-code-punct">,</span></> },
                    { d: ".45s", nodes: <>&nbsp;&nbsp;<span className="text-code-text">total</span> <span className="text-code-type">DECIMAL(10,2)</span> <span className="text-code-keyword">NOT NULL</span><span className="text-code-punct">,</span></> },
                    { d: ".6s", nodes: <>&nbsp;&nbsp;<span className="text-code-text">created_at</span> <span className="text-code-type">TIMESTAMP</span> <span className="text-code-keyword">DEFAULT</span> <span className="text-code-type">now()</span></> },
                    { d: ".75s", nodes: <><span className="text-code-punct">);</span></> },
                  ].map((line, i) => (
                    <div key={i} style={{ animation: "es-line 9s infinite", animationDelay: line.d }}>{line.nodes}</div>
                  ))}
                  <div className="mt-2.5" style={{ animation: "es-line 9s infinite", animationDelay: ".95s" }}>
                    <span className="text-code-keyword">INSERT INTO</span> <span className="text-code-text">orders</span> <span className="text-code-keyword">VALUES</span>
                  </div>
                  <div style={{ animation: "es-line 9s infinite", animationDelay: "1.1s" }}>
                    &nbsp;&nbsp;<span className="text-code-punct">(</span><span className="text-code-type">1</span><span className="text-code-punct">,</span> <span className="text-code-type">1</span><span className="text-code-punct">,</span> <span className="text-code-type">129.90</span><span className="text-code-punct">,</span> <span className="text-code-type">&apos;2026-07-04&apos;</span><span className="text-code-punct">);</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* relations, drawn for you (animated ER diagram) */}
      <section
        className="border-t border-[rgba(16,20,19,0.08)] px-10 pt-[72px] pb-20"
        style={{ backgroundImage: "radial-gradient(rgba(16,20,19,.09) 1px,transparent 1px)", backgroundSize: "22px 22px" }}
      >
        <div className="max-w-[1000px] mx-auto flex flex-col items-center">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2 self-start">Relations, drawn for you.</h2>
          <p className="text-[15px] text-ink-soft max-w-[560px] mb-8 self-start">
            Every schema renders as a live entity-relationship diagram — foreign keys become drawn connector paths.
          </p>

          <div className="w-full flex items-center justify-center h-[588px]">
          <div className="relative w-[578px] shrink-0 scale-[1.4] bg-surface border border-[rgba(16,20,19,0.1)] rounded-[14px] shadow-[0_20px_48px_-22px_rgba(16,20,19,0.22)] h-[420px] overflow-hidden">
            <DiagramBox className="left-7 top-16 w-[190px]" title="users" rows={[["id", "PK", "INT"], ["email", null, "VARCHAR"], ["created_at", null, "TIMESTAMP"]]} />
            <DiagramBox className="right-7 top-[104px] w-[200px]" title="orders" rows={[["id", "PK", "INT"], ["user_id", "FK", "INT"], ["total", null, "DECIMAL"]]} />
            <DiagramBox className="left-[78px] top-[250px] w-[200px]" title="order_items" rows={[["id", "PK", "INT"], ["order_id", "FK", "INT"], ["qty", null, "INT"]]} />

            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 578 420" fill="none">
              <path d="M 218 100 C 300 100, 290 168, 350 168" stroke="#0e8f7e" strokeWidth="1.8" strokeDasharray="340" style={{ animation: "es-draw 7s infinite" }} />
              <path d="M 350 140 C 300 140, 320 314, 278 314" stroke="#0e8f7e" strokeWidth="1.8" strokeDasharray="340" style={{ animation: "es-draw 7s infinite", animationDelay: ".4s" }} />
              <circle cx="218" cy="100" r="3.5" fill="#0e8f7e" />
              <circle cx="350" cy="168" r="3.5" fill="#0e8f7e" />
              <circle cx="350" cy="140" r="3.5" fill="#0e8f7e" />
              <circle cx="278" cy="314" r="3.5" fill="#0e8f7e" />
            </svg>
          </div>
          </div>
        </div>
      </section>

      {/* one schema, three dialects */}
      <section id="specs" className="border-t border-[rgba(16,20,19,0.08)] px-10 pt-[60px] pb-[68px] bg-surface">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-[30px]">One schema. Three dialects.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <DialectCard
              label="postgresql"
              lines={[
                <><span className="text-accent">CREATE TABLE</span> orders (</>,
                <>&nbsp;&nbsp;id <span className="text-amber">SERIAL</span> <span className="text-accent">PRIMARY KEY</span>,</>,
                <>&nbsp;&nbsp;total <span className="text-amber">DECIMAL(10,2)</span></>,
                <>);</>,
              ]}
            />
            <DialectCard
              label="mysql"
              lines={[
                <><span className="text-accent">CREATE TABLE</span> `orders` (</>,
                <>&nbsp;&nbsp;`id` <span className="text-amber">INT AUTO_INCREMENT</span>,</>,
                <>&nbsp;&nbsp;`total` <span className="text-amber">DECIMAL(10,2)</span></>,
                <>);</>,
              ]}
            />
            <DialectCard
              label="sqlite"
              lines={[
                <><span className="text-accent">CREATE TABLE</span> orders (</>,
                <>&nbsp;&nbsp;id <span className="text-amber">INTEGER</span> <span className="text-accent">PRIMARY KEY</span>,</>,
                <>&nbsp;&nbsp;total <span className="text-amber">REAL</span></>,
                <>);</>,
              ]}
            />
          </div>
        </div>
      </section>

      {/* checked before it reaches you */}
      <section className="border-t border-[rgba(16,20,19,0.08)] px-10 pt-14 pb-[68px]">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-[30px]">Checked before it reaches you.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GuaranteeCard kicker="✓ validated" title="Strictly validated" body="Every response is checked against Pydantic models — relationships and syntax are guaranteed correct." />
            <GuaranteeCard kicker="INSERT INTO" title="Seed data included" body="Ready-to-run INSERT scripts with realistic mock rows, mapped to every table." />
            <GuaranteeCard kicker="↓ schema.sql" title="Inspectable workspace" body="Browse tables, copy queries, or download the whole schema as one .sql file." />
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="flex items-center justify-between px-10 py-[22px] border-t border-[rgba(16,20,19,0.08)] bg-surface">
        <span className="font-mono text-[11.5px] text-ink-muted">© 2026 EasySchema</span>
        <div className="flex gap-5">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-mono text-[11.5px] text-ink-soft hover:text-ink transition-colors">github</a>
        </div>
      </footer>
    </div>
  );
}

function DiagramBox({ className, title, rows }: { className: string; title: string; rows: [string, string | null, string][] }) {
  return (
    <div className={`absolute ${className} bg-surface border border-[rgba(16,20,19,0.14)] rounded-[9px] overflow-hidden shadow-[0_4px_12px_-6px_rgba(16,20,19,0.15)]`}>
      <div className="font-mono text-xs font-medium px-3 py-2 bg-accent/[0.08] border-b border-[rgba(16,20,19,0.08)]">{title}</div>
      {rows.map(([name, tag, type]) => (
        <div key={name} className={`font-mono text-[11px] px-3 py-[7px] flex justify-between ${tag === "PK" ? "bg-accent/[0.04]" : tag === "FK" ? "bg-amber/[0.07]" : ""}`}>
          <span>{name} {tag && <span className={tag === "PK" ? "text-accent" : "text-amber"}>{tag}</span>}</span>
          <span className="text-ink-muted">{type}</span>
        </div>
      ))}
    </div>
  );
}

function DialectCard({ label, lines }: { label: string; lines: React.ReactNode[] }) {
  return (
    <div className="border border-[rgba(16,20,19,0.1)] rounded-[11px] overflow-hidden">
      <div className="font-mono text-[11.5px] font-medium px-3.5 py-[9px] bg-[#f4f7f6] border-b border-[rgba(16,20,19,0.08)]">{label}</div>
      <div className="px-4 py-3.5 font-mono text-[11.5px] leading-[1.8] text-[#3c4643]">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

function GuaranteeCard({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="bg-surface border border-[rgba(16,20,19,0.1)] rounded-[13px] px-6 pt-6 pb-[26px]">
      <div className="font-mono text-xs text-accent mb-3.5">{kicker}</div>
      <div className="text-lg font-semibold tracking-[-0.01em] mb-[7px]">{title}</div>
      <div className="text-[13.5px] leading-[1.55] text-ink-soft">{body}</div>
    </div>
  );
}
