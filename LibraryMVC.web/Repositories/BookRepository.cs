using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Data;
using LibraryMVC.web.Models;

namespace LibraryMVC.web.Repositories;

public class BookRepository : IBookRepository
{
    private readonly ApplicationDbContext _db;

    public BookRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public IQueryable<Book> QueryNoTracking()
        => _db.Books.AsNoTracking();

    public async Task<Book?> GetByIdAsync(int id)
        => await _db.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);

    public async Task<Book?> FindAsync(int id)
        => await _db.Books.FindAsync(id);

    public async Task<IList<string>> GetDistinctCategoriesAsync()
        => await _db.Books
            .AsNoTracking()
            .Where(b => b.Category != null)
            .Select(b => b.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

    public async Task<IList<Book>> GetAvailableBooksAsync()
        => await _db.Books
            .AsNoTracking()
            .Where(b => b.AvailableCopies > 0)
            .OrderBy(b => b.Title)
            .ToListAsync();

    public void Add(Book book) => _db.Books.Add(book);

    public void Remove(Book book) => _db.Books.Remove(book);

    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
}
