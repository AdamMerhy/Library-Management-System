using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace LibraryMVC.web.Services;

/// <summary>
/// Calls an OpenAI-compatible /v1/chat/completions endpoint to interpret
/// a natural language library search query into structured JSON filters.
/// Falls back to <see cref="RuleBasedInterpreter"/> on any error.
/// </summary>
public class OpenAiCompatibleInterpreter : IAiSearchInterpreter
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<OpenAiCompatibleInterpreter> _logger;
    private readonly RuleBasedInterpreter _fallback = new();

    private const string SystemPrompt = """
        You are a library search assistant. The user will describe what books they want.
        You MUST reply with ONLY a single JSON object matching this schema – no markdown, no explanation, no extra text:

        {
          "keywords": ["..."],
          "title": "optional",
          "author": "optional",
          "isbn": "optional",
          "category": "optional",
          "tags": ["optional"],
          "language": "optional",
          "publishYearMin": null,
          "publishYearMax": null,
          "availableOnly": null,
          "sortBy": "relevance",
          "limit": 20,
          "explanation": "One or two sentence summary of the interpreted search."
        }

        Rules:
        - Omit or set to null any field that is not mentioned.
        - "sortBy" must be one of: "relevance", "title", "year".
        - "limit" defaults to 20 if not specified.
        - "explanation" is always a short human-readable summary.
        - Output ONLY valid JSON. No code fences.
        """;

    public OpenAiCompatibleInterpreter(
        HttpClient http,
        IConfiguration config,
        ILogger<OpenAiCompatibleInterpreter> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<AiSearchResult> InterpretAsync(string userPrompt, CancellationToken ct = default)
    {
        var baseUrl = _config["Ai:BaseUrl"];
        var model = _config["Ai:Model"];

        if (string.IsNullOrWhiteSpace(baseUrl) || string.IsNullOrWhiteSpace(model))
        {
            _logger.LogInformation("AI configuration missing – using rule-based fallback.");
            return await _fallback.InterpretAsync(userPrompt, ct);
        }

        try
        {
            var apiKey = _config["Ai:ApiKey"];
            var endpoint = baseUrl.TrimEnd('/') + "/chat/completions";

            var requestBody = new
            {
                model,
                messages = new object[]
                {
                    new { role = "system", content = SystemPrompt },
                    new { role = "user", content = userPrompt }
                },
                temperature = 0.2,
                max_tokens = 500
            };

            var json = JsonSerializer.Serialize(requestBody);
            var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            if (!string.IsNullOrWhiteSpace(apiKey))
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _http.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            var doc = JsonDocument.Parse(responseJson);

            var messageContent = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(messageContent))
                throw new InvalidOperationException("Empty AI response.");

            // Strip markdown fences if present
            var cleaned = messageContent.Trim();
            if (cleaned.StartsWith("```"))
            {
                var firstNewLine = cleaned.IndexOf('\n');
                if (firstNewLine > 0) cleaned = cleaned[(firstNewLine + 1)..];
                if (cleaned.EndsWith("```")) cleaned = cleaned[..^3];
                cleaned = cleaned.Trim();
            }

            // Parse into a combined object that includes "explanation"
            using var filterDoc = JsonDocument.Parse(cleaned);
            var root = filterDoc.RootElement;

            var filters = JsonSerializer.Deserialize<AiSearchFilters>(cleaned,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("Failed to deserialise AI filters.");

            string? explanation = null;
            if (root.TryGetProperty("explanation", out var explProp))
                explanation = explProp.GetString();

            return new AiSearchResult
            {
                Filters = filters,
                Explanation = explanation ?? "AI-interpreted search filters.",
                UsedFallback = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI interpreter failed – falling back to rule-based.");
            return await _fallback.InterpretAsync(userPrompt, ct);
        }
    }
}
