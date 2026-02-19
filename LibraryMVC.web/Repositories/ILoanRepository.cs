using LibraryMVC.web.Models;

namespace LibraryMVC.web.Repositories;

public interface ILoanRepository
{
    Task<IList<Loan>> GetAllWithDetailsAsync();
    Task<IList<Loan>> GetByBookIdWithUserAsync(int bookId);
    Task<Loan?> GetByIdWithBookAsync(int id);
    void Add(Loan loan);
    Task SaveChangesAsync();
}
