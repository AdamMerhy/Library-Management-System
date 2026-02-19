using System.Text.RegularExpressions;

namespace LibraryMVC.web.Services;

/// <summary>
/// Rule-based fallback interpreter that extracts structured filters
/// from a natural language query without calling an AI provider.
/// </summary>
public class RuleBasedInterpreter : IAiSearchInterpreter
{
    private static readonly Dictionary<string, string> LanguageMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["arabic"] = "Arabic",
        ["english"] = "English",
        ["french"] = "French",
        ["spanish"] = "Spanish",
        ["german"] = "German",
        ["chinese"] = "Chinese",
        ["japanese"] = "Japanese"
    };

    public Task<AiSearchResult> InterpretAsync(string userPrompt, CancellationToken ct = default)
    {
        var filters = new AiSearchFilters();
        var prompt = userPrompt.Trim();

        // Detect "available"
        if (Regex.IsMatch(prompt, @"\bavailabl\w*\b", RegexOptions.IgnoreCase))
        {
            filters.AvailableOnly = true;
        }

        // Detect language
        foreach (var kvp in LanguageMap)
        {
            if (prompt.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
            {
                filters.Language = kvp.Value;
                break;
            }
        }

        // Detect years
        var yearMatches = Regex.Matches(prompt, @"\b(1[89]\d{2}|20\d{2})\b");
        var years = yearMatches.Select(m => int.Parse(m.Value)).OrderBy(y => y).ToList();
        if (years.Count >= 2)
        {
            filters.PublishYearMin = years.First();
            filters.PublishYearMax = years.Last();
        }
        else if (years.Count == 1)
        {
            filters.PublishYearMin = years[0];
        }

        // Detect "last N years"
        var lastYearsMatch = Regex.Match(prompt, @"last\s+(\d+)\s+years?", RegexOptions.IgnoreCase);
        if (lastYearsMatch.Success && int.TryParse(lastYearsMatch.Groups[1].Value, out var n))
        {
            filters.PublishYearMin = DateTime.UtcNow.Year - n;
            filters.PublishYearMax = DateTime.UtcNow.Year;
        }

        // Extract keywords (remove noise words)
        var noise = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "any","the","a","an","about","from","for","in","on","of","to","with",
            "is","are","was","were","be","been","books","book","available","last","years","year",
            "short","long","find","search","show","me","please","i","want","looking","need"
        };

        // Also remove detected language from keywords
        var languageWords = LanguageMap.Keys.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var words = Regex.Split(prompt, @"[^\w]+")
                         .Where(w => w.Length > 1
                                     && !noise.Contains(w)
                                     && !languageWords.Contains(w)
                                     && !Regex.IsMatch(w, @"^\d+$"))
                         .Distinct(StringComparer.OrdinalIgnoreCase)
                         .ToList();

        if (words.Count > 0)
            filters.Keywords = words;

        var result = new AiSearchResult
        {
            Filters = filters,
            Explanation = "Filters extracted using rule-based analysis (AI provider unavailable).",
            UsedFallback = true
        };

        return Task.FromResult(result);
    }
}
