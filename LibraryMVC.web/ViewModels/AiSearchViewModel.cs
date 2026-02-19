using LibraryMVC.web.Models;
using LibraryMVC.web.Services;

namespace LibraryMVC.web.ViewModels;

public class AiSearchViewModel
{
    public string? Prompt { get; set; }
    public AiSearchFilters? ParsedFilters { get; set; }
    public IList<Book> Results { get; set; } = new List<Book>();
    public string? Explanation { get; set; }
    public bool UsedFallback { get; set; }
}
