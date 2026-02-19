using System.Text.Json.Serialization;

namespace LibraryMVC.web.Services;

public class AiSearchFilters
{
    [JsonPropertyName("keywords")]
    public List<string>? Keywords { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [JsonPropertyName("isbn")]
    public string? Isbn { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }

    [JsonPropertyName("language")]
    public string? Language { get; set; }

    [JsonPropertyName("publishYearMin")]
    public int? PublishYearMin { get; set; }

    [JsonPropertyName("publishYearMax")]
    public int? PublishYearMax { get; set; }

    [JsonPropertyName("availableOnly")]
    public bool? AvailableOnly { get; set; }

    [JsonPropertyName("sortBy")]
    public string? SortBy { get; set; }

    [JsonPropertyName("limit")]
    public int Limit { get; set; } = 20;
}

public class AiSearchResult
{
    public AiSearchFilters Filters { get; set; } = new();
    public string? Explanation { get; set; }
    public bool UsedFallback { get; set; }
}
