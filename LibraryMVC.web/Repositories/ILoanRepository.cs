using LibraryMVC.web.Models;

namespace LibraryMVC.web.Repositories;

public interface ILoanRepository
{
    Task<IList<Loan>> GetAllWithDetailsAsync();
    Task<Loan?> GetByIdWithBookAsync(int id);
    Task<IList<Loan>> GetByBookIdWithUserAsync(int bookId);
    Task<IList<Loan>> GetByUserIdWithBookAsync(string userId);
    Task<bool> HasActiveLoansForBookAsync(int bookId);
    Task RemoveByBookIdAsync(int bookId);
    void Add(Loan loan);
    Task SaveChangesAsync();
}
