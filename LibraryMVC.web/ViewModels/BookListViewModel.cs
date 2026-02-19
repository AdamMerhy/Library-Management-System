using LibraryMVC.web.Models;

namespace LibraryMVC.web.ViewModels;

public class BookListViewModel
{
    public IList<Book> Books { get; set; } = new List<Book>();

    // Search / filter
    public string? SearchTerm { get; set; }
    public string? Category { get; set; }
    public bool AvailableOnly { get; set; }
    public int? PublishYearMin { get; set; }
    public int? PublishYearMax { get; set; }

    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    // For category dropdown
    public IList<string> Categories { get; set; } = new List<string>();
}
