using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Models;
using LibraryMVC.web.Models.Enums;
using LibraryMVC.web.Repositories;

namespace LibraryMVC.web.Services;

public class LoanService : ILoanService
{
    private readonly ILoanRepository _loanRepository;
    private readonly IBookRepository _bookRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public LoanService(
        ILoanRepository loanRepository,
        IBookRepository bookRepository,
        UserManager<ApplicationUser> userManager)
    {
        _loanRepository = loanRepository;
        _bookRepository = bookRepository;
        _userManager = userManager;
    }

    public async Task<IList<Loan>> GetAllLoansAsync()
        => await _loanRepository.GetAllWithDetailsAsync();

    public async Task<Book?> GetBookByIdAsync(int id)
        => await _bookRepository.GetByIdAsync(id);

    public async Task<IList<Loan>> GetLoansByBookIdAsync(int bookId)
        => await _loanRepository.GetByBookIdWithUserAsync(bookId);

    public async Task<IList<Book>> GetAvailableBooksAsync()
        => await _bookRepository.GetAvailableBooksAsync();

    public async Task<IList<ApplicationUser>> GetAllUsersAsync()
        => await _userManager.Users.AsNoTracking().OrderBy(u => u.Email).ToListAsync();

    public async Task<CheckoutResult> CheckoutAsync(int bookId, string userId, int? dueDays)
    {
        var book = await _bookRepository.FindAsync(bookId);
        if (book is null || book.AvailableCopies <= 0)
            return new CheckoutResult { ErrorMessage = "Book is not available for checkout." };

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return new CheckoutResult { ErrorMessage = "User not found." };

        var loan = new Loan
        {
            BookId = bookId,
            BorrowedByUserId = userId,
            BorrowedAt = DateTime.UtcNow,
            DueAt = dueDays.HasValue ? DateTime.UtcNow.AddDays(dueDays.Value) : DateTime.UtcNow.AddDays(14),
            Status = LoanStatus.Borrowed
        };

        book.AvailableCopies--;
        _loanRepository.Add(loan);
        await _loanRepository.SaveChangesAsync();

        return new CheckoutResult
        {
            Succeeded = true,
            BookTitle = book.Title,
            UserEmail = user.Email
        };
    }

    public async Task<CheckinResult> CheckinAsync(int id)
    {
        var loan = await _loanRepository.GetByIdWithBookAsync(id);
        if (loan is null)
            return new CheckinResult { NotFound = true };

        if (loan.Status == LoanStatus.Returned)
            return new CheckinResult { ErrorMessage = "This loan has already been returned." };

        loan.ReturnedAt = DateTime.UtcNow;
        loan.Status = LoanStatus.Returned;
        loan.Book.AvailableCopies++;

        await _loanRepository.SaveChangesAsync();

        return new CheckinResult { Succeeded = true, BookTitle = loan.Book.Title };
    }
}
