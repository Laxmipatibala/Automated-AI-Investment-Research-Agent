import "dotenv/config"; 
import express from "express";
import cors from "cors";
import { researchGraph } from "./workflow/graph.js";

const app = express();
// Hardcoded to a completely clean, isolated port to clear hidden environment variables
const PORT = 7000; 

// Open CORS routing configurations to clear browser locks completely
app.use(cors({
  origin: true, 
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Public health verification route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Express backend engine is responding live." });
});

// Primary operational endpoint that triggers the LangGraph workflow
app.post("/api/research", async (req, res) => {
  const { company } = req.body;

  if (!company) {
    return res.status(400).json({ error: "Company parameter is required." });
  }

  try {
    console.log(`[API Server] Ingesting target research query: ${company}`);
    
    // Invoke your LangGraph workflow instance
    const finalState = await researchGraph.invoke({
      companyName: company
    });

    return res.json(finalState);
  } catch (error) {
    console.error("🚨 [API Server Error] LangGraph workflow runtime failed:", error.message);
    return res.status(500).json({ 
      error: "The investment research agent encountered a processing fault.",
      details: error.message 
    });
  }
});

// Bind explicitly to 0.0.0.0 local network paths to accept loopback requests
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Production Research Backend running on http://127.0.0.1:${PORT}`);
  console.log(`🔗 Verification link available at http://127.0.0.1:${PORT}/api/health`);
});

// Trap runtime binding failures to keep the process from exiting quietly
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ CRITICAL CRASH: Port ${PORT} is currently occupied by another system process!`);
    console.error(`👉 Change the PORT variable assignment on line 6 to 7070 or 8080.\n`);
  } else {
    console.error(`\n🚨 UNCAUGHT SERVER ERROR:`, error.message, `\n`);
  }
  process.exit(1);
});