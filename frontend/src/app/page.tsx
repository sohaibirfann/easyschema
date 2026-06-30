import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6] text-neutral-800 selection:bg-neutral-200 selection:text-black font-sans">
      {/* Soft Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <header className="border-b border-[#e5e5e5] bg-[#F4F5F6]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Linear-style logo */}
            <span className="w-5 h-5 rounded bg-[#111111] flex items-center justify-center font-bold text-white text-xs tracking-tighter">
              S
            </span>
            <span className="font-display font-semibold tracking-tight text-[#111111] text-sm">
              SchemaAI
            </span>
          </div>

          <Link
            href="/generator"
            className="text-xs font-semibold px-3.5 py-1.5 bg-[#111111] hover:bg-[#222222] text-white transition-colors rounded-md tracking-tight"
          >
            Launch app
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-20 pb-24 flex flex-col gap-20 relative z-10">
        <section className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight text-[#111111] leading-[1.08] text-balance">
            Compile prompts directly into database schemas.
          </h1>

          <p className="text-base text-neutral-500 leading-relaxed max-w-xl text-balance">
            Turn natural language specs into precise relational tables, columns, and foreign keys. Includes automatic seed data insertion.
          </p>

          <div className="flex items-center gap-3 pt-3">
            <Link
              href="/generator"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] transition-colors rounded-md tracking-tight"
            >
              Start designing
            </Link>
            <a
              href="#spec"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-neutral-500 bg-white border border-[#e5e5e5] hover:bg-neutral-50 transition-colors rounded-md tracking-tight"
            >
              Read specs
            </a>
          </div>
        </section>

        {/* Linear Workspace Simulator */}
        <section id="spec" className="border border-[#e5e5e5] bg-white rounded-lg p-5 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
            <span className="text-xs font-mono text-neutral-400">interactive-blueprint.sql</span>
            <span className="text-[10px] font-sans font-medium text-neutral-500 bg-[#f4f5f6] px-2 py-0.5 border border-[#e5e5e5] rounded">
              Pydantic compiler
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div className="flex flex-col gap-3">
              <div className="bg-[#f4f5f6] border border-[#e5e5e5] rounded-md p-3.5 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold">User Specification</span>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  "Create products, categories, and purchases tables with keys."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#e5e5e5] bg-white p-3.5 rounded-md flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-neutral-800 uppercase font-bold">Table: categories</span>
                  <div className="space-y-1 font-mono text-[11px] text-neutral-400">
                    <div>id <span className="text-indigo-600">INT [PK]</span></div>
                    <div>name <span className="text-neutral-500">VARCHAR</span></div>
                  </div>
                </div>

                <div className="border border-[#e5e5e5] bg-white p-3.5 rounded-md flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-neutral-800 uppercase font-bold">Table: products</span>
                  <div className="space-y-1 font-mono text-[11px] text-neutral-400">
                    <div>id <span className="text-indigo-600">INT [PK]</span></div>
                    <div>title <span className="text-neutral-500">VARCHAR</span></div>
                    <div>cat_id <span className="text-neutral-500">INT [FK]</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#fafbfb] border border-[#e5e5e5] rounded-md p-3.5 flex flex-col gap-2">
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-semibold">SQL output snippet</span>
              <pre className="font-mono text-xs text-neutral-600 leading-relaxed overflow-x-auto whitespace-pre">
{`CREATE TABLE products (
    id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    cat_id INT REFERENCES categories(id)
);`}
              </pre>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#e5e5e5] bg-white p-5 rounded-lg flex flex-col gap-2.5">
            <h3 className="font-display font-semibold text-base text-[#111111]">Strict Types</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Enforces structured formats on the compiler output using Pydantic model validation. Guarantees correct query brackets and relationships.
            </p>
          </div>

          <div className="border border-[#e5e5e5] bg-white p-5 rounded-lg flex flex-col gap-2.5">
            <h3 className="font-display font-semibold text-base text-[#111111]">Mock Seed Inserts</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Generates ready-to-run INSERT scripts populated with mock rows directly mapped to your relational tables.
            </p>
          </div>

          <div className="border border-[#e5e5e5] bg-white p-5 rounded-lg flex flex-col gap-2.5">
            <h3 className="font-display font-semibold text-base text-[#111111]">Clean Dashboard</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Workspace dashboard styled with soft backgrounds, thin lines, and clear layouts to inspect tables and copy queries with ease.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e5e5] bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500 font-sans font-semibold uppercase tracking-wider">
          <div>&copy; {new Date().getFullYear()} SchemaAI. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#111111] cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-[#111111] cursor-pointer transition-colors">Repository</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
