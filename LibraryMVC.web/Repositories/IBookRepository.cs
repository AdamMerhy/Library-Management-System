using LibraryMVC.web.Models;

namespace LibraryMVC.web.Repositories;

public interface IBookRepository
{
    IQueryable<Book> QueryNoTracking();
    Task<Book?> GetByIdAsync(int id);
    Task<Book?> FindAsync(int id);
    Task<IList<string>> GetDistinctCategoriesAsync();
    Task<IList<Book>> GetAvailableBooksAsync();
    void Add(Book book);
    void Remove(Book book);
    Task SaveChangesAsync();
}
