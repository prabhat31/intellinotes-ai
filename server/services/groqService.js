// Calls the Groq REST API (OpenAI-compatible) with the LLaMA-3.1 8B Instant model.
// Uses the built-in fetch available in Node 18+, so no extra SDK is needed.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildPrompt(text) {
  return `You are an expert academic tutor. Read the study material below and produce structured study content.

Return ONLY a valid JSON object (no markdown, no commentary) with exactly this shape:
{
  "summary": "A clear summary of 120-150 words",
  "keyPoints": ["5 to 8 concise key points"],
  "mcqs": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ],
  "flashcards": [
    { "term": "Important term", "definition": "Short definition" }
  ]
}

Rules:
- Generate exactly 5 MCQs, each with exactly 4 options and a correctIndex from 0 to 3.
- Generate 6 to 8 flashcards.
- Base everything strictly on the given material. Do not invent facts.

STUDY MATERIAL:
"""
${text}
"""`;
}

// Removes ```json fences and any text outside the outermost braces
function cleanJson(raw) {
  let s = (raw || "").trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return s;
}

function validate(data) {
  const errors = [];
  if (typeof data.summary !== "string" || !data.summary.trim()) errors.push("summary");
  if (!Array.isArray(data.keyPoints)) errors.push("keyPoints");
  if (!Array.isArray(data.mcqs)) errors.push("mcqs");
  if (!Array.isArray(data.flashcards)) errors.push("flashcards");
  if (errors.length) {
    const err = new Error(`AI response missing or invalid fields: ${errors.join(", ")}`);
    err.status = 502;
    throw err;
  }

  data.mcqs = data.mcqs
    .filter(
      (m) =>
        m &&
        typeof m.question === "string" &&
        Array.isArray(m.options) &&
        m.options.length >= 2 &&
        Number.isInteger(m.correctIndex) &&
        m.correctIndex >= 0 &&
        m.correctIndex < m.options.length
    )
    .map((m) => ({
      question: m.question,
      options: m.options.map(String),
      correctIndex: m.correctIndex,
    }));

  data.flashcards = data.flashcards
    .filter((f) => f && f.term && f.definition)
    .map((f) => ({ term: String(f.term), definition: String(f.definition) }));

  data.keyPoints = data.keyPoints.map(String);
  return data;
}

async function generateStudyMaterial(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error("GROQ_API_KEY is not configured on the server");
    err.status = 500;
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You output only valid JSON." },
          { role: "user", content: buildPrompt(text) },
        ],
      }),
    });
  } catch (e) {
    const err = new Error(
      e.name === "AbortError" ? "AI request timed out. Please try again." : "Could not reach the AI service."
    );
    err.status = 504;
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`AI service error (${response.status}): ${body.slice(0, 200)}`);
    err.status = response.status === 429 ? 429 : 502;
    throw err;
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;

  let parsed;
  try {
    parsed = JSON.parse(cleanJson(content));
  } catch (e) {
    const err = new Error("AI returned malformed JSON. Please try again.");
    err.status = 502;
    throw err;
  }
  return validate(parsed);
}

module.exports = { generateStudyMaterial, cleanJson, validate };
