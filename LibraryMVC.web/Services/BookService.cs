using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Models;
using LibraryMVC.web.Repositories;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;
    private readonly ILoanRepository _loanRepository;

    public BookService(IBookRepository bookRepository, ILoanRepository loanRepository)
    {
        _bookRepository = bookRepository;
        _loanRepository = loanRepository;
    }

    public async Task<BookListViewModel> GetFilteredBooksAsync(BookListViewModel vm)
    {
        var query = _bookRepository.QueryNoTracking();

        if (!string.IsNullOrWhiteSpace(vm.SearchTerm))
        {
            var term = vm.SearchTerm.Trim();
            query = query.Where(b =>
                b.Title.Contains(term) ||
                b.Author.Contains(term) ||
                (b.ISBN != null && b.ISBN.Contains(term)) ||
                (b.Category != null && b.Category.Contains(term)) ||
                (b.Tags != null && b.Tags.Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(vm.Category))
            query = query.Where(b => b.Category == vm.Category);

        if (vm.AvailableOnly)
            query = query.Where(b => b.AvailableCopies > 0);

        if (vm.PublishYearMin.HasValue)
            query = query.Where(b => b.PublishYear >= vm.PublishYearMin.Value);

        if (vm.PublishYearMax.HasValue)
            query = query.Where(b => b.PublishYear <= vm.PublishYearMax.Value);

        vm.TotalCount = await query.CountAsync();
        vm.Page = Math.Max(1, vm.Page);

        vm.Books = await query
            .OrderBy(b => b.Title)
            .Skip((vm.Page - 1) * vm.PageSize)
            .Take(vm.PageSize)
            .ToListAsync();

        vm.Categories = await _bookRepository.GetDistinctCategoriesAsync();

        return vm;
    }

    public async Task<Book?> GetBookDetailsAsync(int id)
        => await _bookRepository.GetByIdAsync(id);

    public async Task CreateBookAsync(BookCreateEditViewModel vm)
    {
        var book = new Book
        {
            Title = vm.Title,
            Author = vm.Author,
            ISBN = vm.ISBN,
            Category = vm.Category,
            Tags = vm.Tags,
            Description = vm.Description,
            PublishYear = vm.PublishYear,
            Language = vm.Language,
            LocationShelf = vm.LocationShelf,
            CoverImageUrl = vm.CoverImageUrl,
            TotalCopies = vm.TotalCopies,
            AvailableCopies = vm.AvailableCopies
        };

        _bookRepository.Add(book);
        await _bookRepository.SaveChangesAsync();
    }

    public async Task<BookCreateEditViewModel?> GetBookForEditAsync(int id)
    {
        var book = await _bookRepository.FindAsync(id);
        if (book is null) return null;

        return new BookCreateEditViewModel
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            ISBN = book.ISBN,
            Category = book.Category,
            Tags = book.Tags,
            Description = book.Description,
            PublishYear = book.PublishYear,
            Language = book.Language,
            LocationShelf = book.LocationShelf,
            CoverImageUrl = book.CoverImageUrl,
            TotalCopies = book.TotalCopies,
            AvailableCopies = book.AvailableCopies
        };
    }

    public async Task<bool> UpdateBookAsync(int id, BookCreateEditViewModel vm)
    {
        var book = await _bookRepository.FindAsync(id);
        if (book is null) return false;

        book.Title = vm.Title;
        book.Author = vm.Author;
        book.ISBN = vm.ISBN;
        book.Category = vm.Category;
        book.Tags = vm.Tags;
        book.Description = vm.Description;
        book.PublishYear = vm.PublishYear;
        book.Language = vm.Language;
        book.LocationShelf = vm.LocationShelf;
        book.CoverImageUrl = vm.CoverImageUrl;
        book.TotalCopies = vm.TotalCopies;
        book.AvailableCopies = vm.AvailableCopies;
        book.UpdatedAt = DateTime.UtcNow;

        await _bookRepository.SaveChangesAsync();
        return true;
    }

    public async Task<Book?> GetBookForDeleteAsync(int id)
        => await _bookRepository.GetByIdAsync(id);

    public async Task<DeleteBookResult> DeleteBookAsync(int id)
    {
        var book = await _bookRepository.FindAsync(id);
        if (book is null)
            return new DeleteBookResult { NotFound = true };

        if (await _loanRepository.HasActiveLoansForBookAsync(id))
            return new DeleteBookResult
            {
                ErrorMessage = $"Cannot delete '{book.Title}' — it has active loans. All copies must be returned first."
            };

        await _loanRepository.RemoveByBookIdAsync(id);
        _bookRepository.Remove(book);
        await _bookRepository.SaveChangesAsync();

        return new DeleteBookResult { Succeeded = true };
    }

    public async Task<IList<Book>> SearchByFiltersAsync(AiSearchFilters f)
    {
        var query = _bookRepository.QueryNoTracking();

        if (!string.IsNullOrWhiteSpace(f.Title))
            query = query.Where(b => b.Title.Contains(f.Title));

        if (!string.IsNullOrWhiteSpace(f.Author))
            query = query.Where(b => b.Author.Contains(f.Author));

        if (!string.IsNullOrWhiteSpace(f.Isbn))
            query = query.Where(b => b.ISBN != null && b.ISBN.Contains(f.Isbn));

        if (!string.IsNullOrWhiteSpace(f.Category))
            query = query.Where(b => b.Category != null && b.Category.Contains(f.Category));

        if (!string.IsNullOrWhiteSpace(f.Language))
            query = query.Where(b => b.Language != null && b.Language.Contains(f.Language));

        if (f.AvailableOnly == true)
            query = query.Where(b => b.AvailableCopies > 0);

        if (f.PublishYearMin.HasValue)
            query = query.Where(b => b.PublishYear >= f.PublishYearMin.Value);

        if (f.PublishYearMax.HasValue)
            query = query.Where(b => b.PublishYear <= f.PublishYearMax.Value);

        if (f.Tags is { Count: > 0 })
        {
            foreach (var tag in f.Tags)
            {
                var t = tag;
                query = query.Where(b => b.Tags != null && b.Tags.Contains(t));
            }
        }

        if (f.Keywords is { Count: > 0 })
        {
            foreach (var kw in f.Keywords)
            {
                var k = kw;
                query = query.Where(b =>
                    b.Title.Contains(k) ||
                    b.Author.Contains(k) ||
                    (b.Description != null && b.Description.Contains(k)) ||
                    (b.Tags != null && b.Tags.Contains(k)) ||
                    (b.Category != null && b.Category.Contains(k)));
            }
        }

        query = f.SortBy?.ToLowerInvariant() switch
        {
            "title" => query.OrderBy(b => b.Title),
            "year" => query.OrderByDescending(b => b.PublishYear),
            _ => query.OrderBy(b => b.Title)
        };

        var limit = f.Limit > 0 ? f.Limit : 20;
        return await query.Take(limit).ToListAsync();
    }
}
