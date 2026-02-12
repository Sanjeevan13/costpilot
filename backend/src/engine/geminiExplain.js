import dotenv from "dotenv";
import { fallbackExplain } from "./explainFallback.js";

dotenv.config();

function buildPrompt(type, facts) {
  return `
You are a financial assistant for Malaysia cost-of-living planning.
Return ONLY valid JSON with keys: headline, reason, tradeoff, confidence (0-100).
No markdown. No extra keys. No advice to invest in specific products.

TYPE: ${type}
FACTS (do not change numbers):
${JSON.stringify(facts)}

Now output JSON only.
`.trim();
}

export async function explainWithGemini(type, facts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackExplain(type, facts);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(type, facts) }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!resp.ok) return fallbackExplain(type, facts);

    const data = await resp.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse JSON safely
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return fallbackExplain(type, facts);

    const parsed = JSON.parse(text.slice(start, end + 1));

    // Basic validation
    if (
      typeof parsed.headline !== "string" ||
      typeof parsed.reason !== "string" ||
      typeof parsed.tradeoff !== "string" ||
      typeof parsed.confidence !== "number"
    ) return fallbackExplain(type, facts);

    parsed.confidence = Math.max(0, Math.min(100, Math.round(parsed.confidence)));
    return parsed;
  } catch {
    return fallbackExplain(type, facts);
  }
}
