import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchAgentState } from "./state.js";
import { TavilySearch } from "@langchain/tavily";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";

// ==========================================
// 1. Structured Output Zod Validation Schemas
// ==========================================

const riskAssessmentSchema = z.object({
  risks: z.array(
    z.string().describe("An explicit business, macro, financial, or valuation risk factor facing the target firm.")
  ),
});

const investmentEvaluationSchema = z.object({
  verdict: z.enum(["Invest", "Pass", "Needs Review"]).describe("The final investment stance decided by the committee."),
  reasoningSummary: z.string().describe("A rigorous, comprehensive paragraph summarizing the data thesis, growth landscape, and risk mitigation profiles."),
});

// ==========================================
// 2. Automated Core Workflow Nodes
// ==========================================

/**
 * Node 1: Executes real-time web search for financial updates using Tavily.
 */
async function researchCompanyNode(state) {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("❌ RUNTIME ERROR: 'TAVILY_API_KEY' is missing from environment variables.");
  }

  const queryCompany = state.companyName;
  if (!queryCompany) return { rawData: [] };

  console.log(`[Node: researchCompanyNode] Running live financial search for: ${queryCompany}`);
  const targetQuery = `Latest financial performance, earnings trends, and market news for ${queryCompany}`;

  try {
    const searchTool = new TavilySearch({ maxResults: 3 });
    const rawResponse = await searchTool.invoke({ query: targetQuery });
    let searchRecords = [];

    if (typeof rawResponse === "string") {
      const parsedContainer = JSON.parse(rawResponse);
      searchRecords = parsedContainer.results || [];
    } else if (rawResponse && typeof rawResponse === "object") {
      searchRecords = rawResponse.results || [];
    }

    const searchDataPayload = searchRecords.map((item) => ({
      source: item.title || "Tavily Source",
      url: item.url || "N/A",
      snippet: item.content || item.snippet || "",
      fetchedAt: new Date().toISOString(),
    }));

    console.log(`[Node: researchCompanyNode] Successfully integrated ${searchDataPayload.length} live context streams.`);
    return { rawData: searchDataPayload };

  } catch (error) {
    console.error(`🚨 [Node: researchCompanyNode] Failed to query search engine:`, error.message);
    return {
      rawData: [{
        source: "Search Provider Fallback",
        url: "N/A",
        snippet: `Unable to aggregate live tracking details for ${queryCompany} due to provider fault: ${error.message}`,
        fetchedAt: new Date().toISOString()
      }]
    };
  }
}

/**
 * Node 2: Risk Assessment Engine
 */
async function assessRisksNode(state) {
  const activeGoogleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!activeGoogleKey) {
    throw new Error("❌ RUNTIME ERROR: Neither 'GOOGLE_API_KEY' nor 'GEMINI_API_KEY' was found.");
  }

  console.log(`[Node: assessRisksNode] Processing ${state.rawData.length} search streams via Structured Gemini LLM...`);

  const contextBlock = state.rawData.map(d => `Source: ${d.source}\nContext: ${d.snippet}`).join("\n\n");
  const systemPrompt = `You are an expert financial risk auditor. Review the real-time target data for the firm "${state.companyName}". Identify 2-3 specific financial, business, operational, or macro risks directly mentioned or implied by the provided tracking snippets.`;

  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: activeGoogleKey,
      temperature: 0.1,
    });

    const structuredLlm = llm.withStructuredOutput(riskAssessmentSchema);
    const structuredResult = await structuredLlm.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: contextBlock || "No primary context could be located." }
    ]);

    return { risks: structuredResult.risks };
  } catch (error) {
    console.error("🚨 [Node: assessRisksNode] Structured LLM mapping failed:", error.message);
    return { risks: ["Failed to assess market risk profiles due to schema parsing errors."] };
  }
}

/**
 * Node 3: Portfolio Investment Committee Execution Node
 */
async function evaluateInvestmentNode(state) {
  const activeGoogleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!activeGoogleKey) {
    throw new Error("❌ RUNTIME ERROR: Neither 'GOOGLE_API_KEY' nor 'GEMINI_API_KEY' was found.");
  }

  console.log("[Node: evaluateInvestmentNode] Formulating final structural investment thesis...");

  const dataContext = state.rawData.map(d => `- [${d.source}]: ${d.snippet}`).join("\n");
  const riskContext = state.risks.map(r => `- ${r}`).join("\n");

  const systemPrompt = `You are the Chairman of an Institutional Investment Committee. Synthesize all verified underlying metrics alongside identified market risk flags to form an empirical investment verdict.`;
  const userContent = `Target Entity: ${state.companyName}\n\nGathered Research Context:\n${dataContext}\n\nAudited Vulnerability Risks:\n${riskContext}`;

  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: activeGoogleKey,
      temperature: 0.1,
    });

    const structuredLlm = llm.withStructuredOutput(investmentEvaluationSchema);
    const structuredResult = await structuredLlm.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ]);

    return {
      verdict: structuredResult.verdict,
      reasoningSummary: structuredResult.reasoningSummary
    };
  } catch (error) {
    console.error("🚨 [Node: evaluateInvestmentNode] Structured Thesis generation failed:", error.message);
    return {
      verdict: "Needs Review",
      reasoningSummary: `Failed to compile a structured final asset decision due to schema runtime error: ${error.message}`
    };
  }
}

// ==========================================
// 3. Assemble and Compile Graph Topology
// ==========================================
const workflow = new StateGraph(ResearchAgentState)
  .addNode("researchCompany", researchCompanyNode)
  .addNode("assessRisks", assessRisksNode)
  .addNode("evaluateInvestment", evaluateInvestmentNode)

  .addEdge(START, "researchCompany")
  .addEdge("researchCompany", "assessRisks")
  .addEdge("assessRisks", "evaluateInvestment")
  .addEdge("evaluateInvestment", END);

export const researchGraph = workflow.compile();