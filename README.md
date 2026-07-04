<div align="center">

  <span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:8px;background:#111;color:#fff;font-weight:700;font-size:24px;font-family:system-ui">S</span>

  # SchemaAI

  **From natural language to production-ready SQL schemas in seconds.**

  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square)](https://fastapi.tiangolo.com)
  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
  [![Pydantic](https://img.shields.io/badge/Pydantic-2-E92063?style=flat-square)](https://docs.pydantic.dev)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

  [**Live demo**](https://easyschema.vercel.app) • [Overview](#overview) • [Architecture](#architecture) • [Getting started](#getting-started) • [Features](#features)

  > Hosted on free tiers — the backend spins down when idle, so the first request after a while may take up to ~30s to wake up.

</div>

## Overview

SchemaAI is a full-stack application that translates plain English descriptions of database structures into complete, executable SQL — both `CREATE TABLE` DDL and `INSERT` seed DML — powered by Groq's LLM and enforced through Pydantic schema validation.

> [!TIP]
> You don't need any database setup to use SchemaAI. Just describe what you want and copy the generated SQL.

## Architecture

```
schema-ai/
├── backend/                    # FastAPI server (port 8000)
│   ├── main.py                 # Entry point with CORS
│   ├── routers/schema.py       # POST /api/generate
│   ├── models/schema.py        # Pydantic models
│   ├── services/
│   │   ├── ai_service.py       # Async Groq API caller
│   │   └── sql_generator.py    # DDL/DML formatter
│   └── test_service.py
│
├── frontend/                   # Next.js App Router (port 3000)
│   └── src/app/
│       ├── page.tsx            # Landing page
│       ├── layout.tsx          # Root layout (Outfit, Inter, Fira Code)
│       ├── globals.css         # Tailwind theme
│       └── generator/page.tsx  # Workspace dashboard
│
└── .agents/
    └── skills/                 # Agent skills
```

### How it works

1. You type a schema description in natural language (e.g. *"E-commerce store with orders, items, inventory and users"*)
2. The frontend sends it to `POST /api/generate`
3. The backend calls Groq's `llama-3.3-70b-versatile` model with strict JSON mode, enforcing the Pydantic schema
4. The AI returns structured table definitions with seed data
5. The backend compiles these into formatted `CREATE TABLE` and `INSERT` SQL statements
6. The frontend displays columns in a metadata table and SQL in copyable/downloadable panels

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- A [Groq API key](https://console.groq.com/keys)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Create .env with your API key
cp .env.example .env
# Edit .env: GROQ_API_KEY=your_key_here

uvicorn main:app --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev proxy in `next.config.ts` routes `/api/*` requests to the backend automatically.

## Features

- **Natural language to SQL** — Describe your schema in plain English, get valid `CREATE TABLE` and `INSERT` statements
- **Pydantic-enforced output** — The AI response is validated against a strict schema before any SQL is generated
- **Structured column viewer** — Per-table breakdown of columns, types, and constraints in a readable table
- **Per-table SQL panels** — Copy DDL or seed DML to clipboard, or download as `.sql` files
- **Schema history** — A collapsible right-side drawer stores up to 20 previous generations in local storage, with relative timestamps and one-click restore
- **3 preset prompts** — Quick-start buttons for common schema types (e-commerce, blog, project board)

