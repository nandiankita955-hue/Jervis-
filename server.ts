import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK helper
const getGeminiClient = (req: express.Request) => {
  const customKey = req.headers["x-api-key"] || req.body.userApiKey;
  const finalKey = (typeof customKey === "string" && customKey.trim()) 
    ? customKey.trim() 
    : process.env.GEMINI_API_KEY;

  if (!finalKey) return null;

  return new GoogleGenAI({
    apiKey: finalKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const aiClient = getGeminiClient(req);

    if (!aiClient) {
      // Graceful fallback if API key is not yet set
      return res.json({
        text: "I am currently running in offline simulation mode, Sir. To enable full cognitive functions, please configure my neural matrix with a valid GEMINI_API_KEY in the Settings tab of my HUD console."
      });
    }

    // Convert messages to format acceptable by SDK
    const formattedContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: "You are JARVIS, the highly sophisticated British AI voice assistant built by Tony Stark. Your speech is elegant, refined, witty, and deeply loyal. You always refer to the user as 'Sir' or 'Ma'am'. Keep responses brief, punchy, and highly conversational (no lists). You have direct control over hardware protocols: Flashlight/Torch (can be toggled on/off) and WhatsApp Communications Gateway (which launches direct message draft protocols). If the user speaks in Bengali or requests Bengali assistance, respond in an elegant, polite, butler-like Bengali-English blend (e.g. 'অবশ্যই স্যার, ফ্ল্যাশলাইট প্রোটোকল সচল করছি' or 'নিশ্চয়ই স্যার, হোয়াটসঅ্যাপ ডেকের সাথে সংযোগ স্থাপন করা হচ্ছে।'). Always stay in character as a brilliant assistant.",
        temperature: 0.8,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "My cognitive systems have encountered an anomaly: " + error.message });
  }
});

// Setup Vite Dev Server / Static Assets serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Jervis Server] Online & listening on port ${PORT}`);
  });
}

setupServer();
