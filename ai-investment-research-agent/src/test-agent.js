// ALWAYS dynamic import/load env first
import 'dotenv/config'; 
import { researchGraph } from "./workflow/graph.js";

async function testAgent() {
  const initialState = { companyName: "NVIDIA" };
  console.log("Starting Live Investment Research Agent Workflow...");
  
  const finalState = await researchGraph.invoke(initialState);
  console.log("\n--- Final Workflow State ---");
  console.log(JSON.stringify(finalState, null, 2));
}

testAgent();