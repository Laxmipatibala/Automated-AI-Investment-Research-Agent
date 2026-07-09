# Automated AI Investment Research Agent

A full-stack, multi-agent financial research pipeline built with **LangGraph.js**, **Gemini 2.5 Flash**, **Tavily Search API**, and a **React (Vite)** dashboard.

The system performs **real-time market discovery**, extracts **structured risk profiles** via schema validation, and produces **investment verdicts** with an auditable reasoning summary.

---

## Overview & Core Features

**AlphaEngine** converts fragmented market updates into actionable investment intelligence cards.

- **Real-Time Data Harvesting:** Searches financial sources via **Tavily** to avoid model training cutoffs.
- **Rigorous Risk Auditing:** Uses **Zod** schemas to isolate vulnerabilities across business, valuation, macro, and sector dimensions.
- **Structured Output Guarantee:** Uses **`.withStructuredOutput()`** to force typed outputs that match the workflow state.
- **Modern Executive Interface:** A dark-mode dashboard with progress-stage tracking, explicit risk lists, and expandable reference drawers.

---

## Architecture & Workflow

The processing engine is a **stateful, cyclic directed graph** implemented with `@langchain/langgraph`.

### Core State & Annotation Model
Unlike legacy LangChain flows that parse text loosely, AlphaEngine uses the **LangGraph Annotation API** to maintain type safety across nodes.

```js
import { Annotation } from "@langchain/langgraph";

export const ResearchAgentState = Annotation.Root({
  companyName: Annotation(), // Current target ticker/firm string
  rawData: Annotation(),     // Array of aggregated Tavily search objects
  risks: Annotation(),       // Array of parsed risk strings
  verdict: Annotation(),     // "Invest" | "Pass" | "Needs Review"
  reasoningSummary: Annotation() // Markdown-formatted technical justification
});
```

### Node Topology Execution
Nodes run sequentially and write results back into shared state:

- **`researchCompanyNode` (Data Gatherer):**
  - Reads `companyName`
  - Queries Tavily
  - Stores structured results (title/URL/snippet) into `rawData`

- **`assessRisksNode` (Risk Auditor):**
  - Evaluates `rawData`
  - Uses a Gemini context and validates output against a strict Zod schema:
    - `z.object({ risks: z.array(z.string()) })`
  - Writes parsed risk strings into `risks`

- **`evaluateInvestmentNode` (Investment Committee):**
  - Reads both `rawData` and `risks`
  - Produces the terminal consensus fields: `verdict` and `reasoningSummary`

---

## Local Installation & Configuration

### Prerequisites
- **Node.js v22+**

### Backend (`ai-investment-research-agent`)
```bash
cd ai-investment-research-agent
npm install
```

Create `.env` in `ai-investment-research-agent/`:
```bash
PORT=7000
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Start the server:
```bash
node src/server.js
```

### Frontend (`ai-research-dashboard`)
```bash
cd ai-research-dashboard
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

Open:
- http://localhost:5173

---

## Engineering Decisions & Trade-offs

### Graph Stateful Architecture vs. Linear Chains
- **Decision:** Use a rigid **state machine graph** instead of a single long prompt.
- **Trade-off:** Slightly more engineering complexity, but avoids prompt drift, hallucinations, and formatting failures.

### Structured Zod Enforcement over Loose Text
- **Decision:** Enforce JSON output with `.withStructuredOutput()` and Zod-compatible shapes.
- **Trade-off:** Slight token/latency overhead, but prevents UI-breaking format errors.

### MVP Scope (7-Day Constraints)
Vector-database RAG embedding for historical SEC filings (e.g., Pinecone/ChromaDB) was intentionally deferred to prioritize **real-time parsing reliability**.

---

## Live Production Execution Records

### Test Case A: NVIDIA (Growth Verdict)
```json
{
  "companyName": "NVIDIA",
  "rawData": [
    {
      "source": "NVIDIA (NVDA) Earnings Date & Report - Investing.com",
      "url": "https://www.investing.com/equities/nvidia-corp-earnings",
      "snippet": "NVIDIA Q1 FY2027 revenue hit $82B (up 85% YoY), EPS $1.87 beat forecast of $1.77; stock rose 1.37% after-hours to $223.63 · Data center revenue surged 92% YoY to..."
    }
  ],
  "risks": [
    "Over-reliance on the Data Center segment for primary revenue growth loops, exposing values to localized macro equipment shifts.",
    "Extremely high baseline consensus expectations making valuations highly volatile if year-over-year progress loops stabilize."
  ],
  "verdict": "Invest",
  "reasoningSummary": "NVIDIA demonstrates exceptional market performance with Q1 FY2027 revenue reaching $82 billion (up 85% YoY), powered by a 92% surge in specialized data center infrastructure. The firm effectively acts as the core foundational layer for scaling the global AI workspace. While valuation margins reflect high growth projections, market pricing remains deeply anchored by tangible earnings and dominant institutional market share profiles."
}
```

### Test Case B: Apple (Defensive Stance)
```json
{
  "companyName": "APPLE",
  "rawData": [
    {
      "source": "Bloomberg Technology Structural News Reports",
      "url": "https://www.bloomberg.com/news/articles/apple-supply-margins",
      "snippet": "Hardware ecosystem metrics indicate shifting global margins with standard seasonal tracking showing localized optimization delays..."
    }
  ],
  "risks": [
    "Geographic hardware supply chain exposure profiles creating localized shipping vulnerabilities.",
    "Ecosystem friction stemming from regulatory policy changes across international economic sectors."
  ],
  "verdict": "Pass",
  "reasoningSummary": "Apple maintains unprecedented consumer brand loyalty and reliable operating margins. However, at current evaluation tiers, macro regulatory blocks across international sectors introduce structural earnings risk. Given compressing localized hardware revenue metrics, capital is better allocated into assets displaying immediate, unencumbered infrastructure tailwinds."
}
```

---

## Strategic Roadmap (Future Improvements)

- **Live streaming node states via WebSockets:** Replace HTTP POST flows with long-lived Socket.io event loops to stream node diffs to the frontend.
- **SEC filings engine integration:** Extend tools to ingest SEC EDGAR filings (10-K/10-Q), run local chunking, and provide long-horizon context to Gemini.
- **Multi-asset comparative mode:** Ingest multiple companies at once and produce comparative sector-level matrices.

