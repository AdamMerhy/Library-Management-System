using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Data;
using LibraryMVC.web.Models;

namespace LibraryMVC.web.Repositories;

public class LoanRepository : ILoanRepository
{
    private readonly ApplicationDbContext _db;

    public LoanRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IList<Loan>> GetAllWithDetailsAsync()
        => await _db.Loans
            .AsNoTracking()
            .Include(l => l.Book)
            .Include(l => l.BorrowedByUser)
            .OrderByDescending(l => l.BorrowedAt)
            .ToListAsync();

    public async Task<IList<Loan>> GetByBookIdWithUserAsync(int bookId)
        => await _db.Loans
            .AsNoTracking()
            .Include(l => l.BorrowedByUser)
            .Where(l => l.BookId == bookId)
            .OrderByDescending(l => l.BorrowedAt)
            .ToListAsync();

    public async Task<Loan?> GetByIdWithBookAsync(int id)
        => await _db.Loans
            .Include(l => l.Book)
            .FirstOrDefaultAsync(l => l.Id == id);

    public void Add(Loan loan) => _db.Loans.Add(loan);

    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
}
