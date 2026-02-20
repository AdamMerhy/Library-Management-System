using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Data;
using LibraryMVC.web.Models;
using LibraryMVC.web.Models.Enums;

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

    public async Task<IList<Loan>> GetByUserIdWithBookAsync(string userId)
        => await _db.Loans
            .AsNoTracking()
            .Include(l => l.Book)
            .Where(l => l.BorrowedByUserId == userId)
            .OrderByDescending(l => l.BorrowedAt)
            .ToListAsync();

    public async Task<Loan?> GetByIdWithBookAsync(int id)
        => await _db.Loans
            .Include(l => l.Book)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<bool> HasActiveLoansForBookAsync(int bookId)
        => await _db.Loans.AnyAsync(l => l.BookId == bookId && l.Status == LoanStatus.Borrowed);

    public async Task RemoveByBookIdAsync(int bookId)
    {
        var loans = await _db.Loans.Where(l => l.BookId == bookId).ToListAsync();
        _db.Loans.RemoveRange(loans);
    }

    public void Add(Loan loan) => _db.Loans.Add(loan);

    public async Task SaveChangesAsync() => await _db.SaveChangesAsync();
}
