using LibraryMVC.web.Models;

namespace LibraryMVC.web.Services;

public interface ILoanService
{
    Task<IList<Loan>> GetAllLoansAsync();
    Task<Book?> GetBookByIdAsync(int id);
    Task<IList<Loan>> GetLoansByBookIdAsync(int bookId);
    Task<IList<Loan>> GetLoansByUserIdAsync(string userId);
    Task<IList<Book>> GetAvailableBooksAsync();
    Task<IList<ApplicationUser>> GetAllUsersAsync();
    Task<CheckoutResult> CheckoutAsync(int bookId, string userId, int? dueDays);
    Task<CheckinResult> CheckinAsync(int id);
}

public class CheckoutResult
{
    public bool Succeeded { get; init; }
    public string? ErrorMessage { get; init; }
    public string? BookTitle { get; init; }
    public string? UserEmail { get; init; }
}

public class CheckinResult
{
    public bool Succeeded { get; init; }
    public bool NotFound { get; init; }
    public string? ErrorMessage { get; init; }
    public string? BookTitle { get; init; }
}
