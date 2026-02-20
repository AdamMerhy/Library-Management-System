using LibraryMVC.web.Models;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Services;

public interface IBookService
{
    Task<BookListViewModel> GetFilteredBooksAsync(BookListViewModel vm);
    Task<Book?> GetBookDetailsAsync(int id);
    Task CreateBookAsync(BookCreateEditViewModel vm);
    Task<BookCreateEditViewModel?> GetBookForEditAsync(int id);
    Task<bool> UpdateBookAsync(int id, BookCreateEditViewModel vm);
    Task<Book?> GetBookForDeleteAsync(int id);
    Task<DeleteBookResult> DeleteBookAsync(int id);
    Task<IList<Book>> SearchByFiltersAsync(AiSearchFilters filters);
}

public class DeleteBookResult
{
    public bool Succeeded { get; init; }
    public bool NotFound { get; init; }
    public string? ErrorMessage { get; init; }
}
