import type { AiSearchFilters, AiSearchResult } from "@/types";

const SYSTEM_PROMPT = `You are a strict library search query interpreter.

Your job is to convert a natural language request into a JSON object containing structured filters for a library database.

You DO NOT answer questions. You DO NOT recommend books.
You ONLY return structured JSON.

=====================
CRITICAL RULES
=====================

1. OUTPUT FORMAT
- Return ONLY valid JSON.
- Do NOT include markdown, code blocks, or any extra text.
- The response must be parseable by JSON.parse without errors.

2. STRICT FIELD USAGE
- Only set a field if the user EXPLICITLY provides that information.
- Otherwise, set it to null.

Examples:
- "books by Stephen King" → author = "Stephen King"
- "fiction books" → category = "Fiction"
- "books about discipline" → category = null (do NOT guess)

3. KEYWORD EXTRACTION (MOST IMPORTANT)
- Extract keywords that represent the DISTINGUISHING or NARROWING concepts.
- When the query combines a broad category with a specific qualifier,
  put the broad concept in "category" and the qualifier in "keywords".
- Include synonyms, related terms, and common variations.

Examples:
  "french food books"
  → category: "Cooking", keywords: ["french", "france", "provençal"]
  (the broad concept "food/cooking" goes in category; the narrowing concept "french" goes in keywords)

  "scary fiction books"
  → category: "Fiction", keywords: ["horror", "scary", "thriller", "suspense", "dark"]

  "books about discipline and motivation"
  → category: null, keywords: ["discipline", "motivation", "habits", "focus", "self-control", "productivity"]
  (no obvious category — rely on keywords only)

- Do NOT include stop words (e.g. "a", "the", "books", "want")

4. TITLE / AUTHOR / ISBN
- Only set if explicitly mentioned.
- Do NOT infer or guess.

5. CATEGORY
- Set if the user explicitly names a category OR if the query clearly implies one.
- Clear implications:
    "food books" / "cookbook" / "recipes" → "Cooking"
    "novels" / "stories" → "Fiction"
    "history books" → "History"
    "science books" → "Science"
    "fantasy books" → "Fantasy"
- When in doubt (e.g. "books about discipline"), do NOT set — keep null.

6. TAGS
- Set to null or empty array.
- Put all search terms in "keywords" instead for best results.

7. LANGUAGE
- Set only if explicitly mentioned (e.g. "Arabic", "English").

8. AVAILABILITY
- If user mentions:
  - "available"
  - "can borrow"
  - "in stock"
→ set availableOnly = true

9. YEAR RANGE
- If user says:
  - "last 10 years" → publishYearMin = currentYear - 10
  - "after 2015" → publishYearMin = 2015
  - "before 2000" → publishYearMax = 2000

10. SORTING
- If user requests sorting:
  - "latest" → "year"
  - "alphabetical" → "title"
- Otherwise default to "relevance"

11. LIMIT
- Default = 20
- Never exceed 50

12. EXPLANATION
- Provide a SHORT 1-sentence explanation of how you interpreted the query.
- Do NOT include additional commentary.

13. SAFETY
- Never invent data.
- Never assume values.
- If unsure, use null.

=====================
OUTPUT SCHEMA
=====================

{
  "keywords": ["string"],
  "title": null,
  "author": null,
  "isbn": null,
  "category": null,
  "tags": null,
  "language": null,
  "publishYearMin": null,
  "publishYearMax": null,
  "availableOnly": null,
  "sortBy": "relevance|title|year",
  "limit": 20,
  "explanation": "string"
}`;

export async function interpretAiSearch(
  userPrompt: string
): Promise<AiSearchResult> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not set");

    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 512,
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    let content: string = data.choices[0].message.content ?? "";

    // Strip markdown code blocks if present
    content = content.trim();
    if (content.startsWith("```")) {
      const firstNewline = content.indexOf("\n");
      if (firstNewline > 0) content = content.slice(firstNewline + 1);
      if (content.endsWith("```")) content = content.slice(0, -3);
      content = content.trim();
    }

    const parsed = JSON.parse(content);

    return {
      filters: mapToFilters(parsed),
      explanation: parsed.explanation ?? `Searched for: ${userPrompt}`,
      usedFallback: false,
    };
  } catch (error) {
    console.warn("Groq API call failed — falling back to keyword search", error);
    return fallback(userPrompt);
  }
}

function mapToFilters(dto: any): AiSearchFilters {
  if (!dto) return {};
  return {
    keywords: dto.keywords ?? null,
    title: dto.title ?? null,
    author: dto.author ?? null,
    isbn: dto.isbn ?? null,
    category: dto.category ?? null,
    tags: dto.tags ?? null,
    language: dto.language ?? null,
    publishYearMin: dto.publishYearMin ?? null,
    publishYearMax: dto.publishYearMax ?? null,
    availableOnly: dto.availableOnly ?? null,
    sortBy: dto.sortBy ?? null,
    limit: dto.limit > 0 ? dto.limit : 20,
  };
}

function fallback(prompt: string): AiSearchResult {
  return {
    filters: {
      keywords: prompt
        .split(/\s+/)
        .filter((w) => w.length > 1),
    },
    explanation: `Searching for: ${prompt}`,
    usedFallback: true,
  };
}
