import { Annotation } from "@langchain/langgraph";

/**
 * Defines the shared state schema for the Investment Research Agent.
 * Annotation.Root acts as the central memory wrapper for the StateGraph pipeline.
 */
export const ResearchAgentState = Annotation.Root({
  // 1. The company name or ticker being researched (e.g., "NVIDIA" or "AAPL")
  companyName: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),

  // 2. Raw research data collected from financial APIs or web search engines
  // Uses a list-append reducer so multiple data nodes can build on top of each other
  rawData: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  // 3. Identified business, financial, and market risks
  risks: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  // 4. The final investment verdict (Invest, Pass, or Needs Review)
  verdict: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "Needs Review",
  }),

  // 5. The detailed reasoning summary behind the final decision
  reasoningSummary: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
});