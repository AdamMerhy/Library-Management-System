using System.Text;
using System.Text.Json;

namespace LibraryMVC.web.Services;

public class GroqAiSearchInterpreter : IAiSearchInterpreter
{
    private readonly HttpClient _http;
    private readonly ILogger<GroqAiSearchInterpreter> _logger;

    private const string SystemPrompt = """
        You are a strict library search query interpreter.

        Your job is to convert a natural language request into a JSON object containing structured filters for a library database.

        You DO NOT answer questions. You DO NOT recommend books.
        You ONLY return structured JSON.

        =====================
        CRITICAL RULES
        =====================

        1. OUTPUT FORMAT
        - Return ONLY valid JSON.
        - Do NOT include markdown, code blocks, or any extra text.
        - The response must be parseable by System.Text.Json without errors.

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
        }
        """;

    public GroqAiSearchInterpreter(HttpClient http, ILogger<GroqAiSearchInterpreter> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<AiSearchResult> InterpretAsync(string userPrompt, CancellationToken ct = default)
    {
        try
        {
            var body = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new object[]
                {
                    new { role = "system", content = SystemPrompt },
                    new { role = "user", content = userPrompt }
                },
                temperature = 0.1,
                max_tokens = 512
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "openai/v1/chat/completions")
            {
                Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            };

            var response = await _http.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(responseJson);

            var content = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            content = content.Trim();
            if (content.StartsWith("```"))
            {
                var firstNewline = content.IndexOf('\n');
                if (firstNewline > 0) content = content[(firstNewline + 1)..];
                if (content.EndsWith("```")) content = content[..^3];
                content = content.Trim();
            }

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var parsed = JsonSerializer.Deserialize<GroqResponseDto>(content, options);

            return new AiSearchResult
            {
                Filters = MapToFilters(parsed),
                Explanation = parsed?.Explanation ?? $"Searched for: {userPrompt}",
                UsedFallback = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Groq API call failed — falling back to keyword search");
            return Fallback(userPrompt);
        }
    }

    private static AiSearchFilters MapToFilters(GroqResponseDto? dto) =>
        dto is null ? new AiSearchFilters() : new AiSearchFilters
        {
            Keywords = dto.Keywords,
            Title = dto.Title,
            Author = dto.Author,
            Isbn = dto.Isbn,
            Category = dto.Category,
            Tags = dto.Tags,
            Language = dto.Language,
            PublishYearMin = dto.PublishYearMin,
            PublishYearMax = dto.PublishYearMax,
            AvailableOnly = dto.AvailableOnly,
            SortBy = dto.SortBy,
            Limit = dto.Limit > 0 ? dto.Limit : 20
        };

    private static AiSearchResult Fallback(string prompt) => new()
    {
        Filters = new AiSearchFilters
        {
            Keywords = prompt.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(w => w.Length > 1).ToList()
        },
        Explanation = $"Searching for: {prompt}",
        UsedFallback = true
    };

    private sealed class GroqResponseDto
    {
        public List<string>? Keywords { get; set; }
        public string? Title { get; set; }
        public string? Author { get; set; }
        public string? Isbn { get; set; }
        public string? Category { get; set; }
        public List<string>? Tags { get; set; }
        public string? Language { get; set; }
        public int? PublishYearMin { get; set; }
        public int? PublishYearMax { get; set; }
        public bool? AvailableOnly { get; set; }
        public string? SortBy { get; set; }
        public int Limit { get; set; } = 20;
        public string? Explanation { get; set; }
    }
}