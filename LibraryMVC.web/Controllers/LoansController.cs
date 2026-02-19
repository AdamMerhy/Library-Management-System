using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using LibraryMVC.web.Services;

namespace LibraryMVC.web.Controllers;

[Authorize(Policy = "ManageLoans")]
public class LoansController : Controller
{
    private readonly ILoanService _loanService;

    public LoansController(ILoanService loanService)
    {
        _loanService = loanService;
    }

    // GET: /Loans
    public async Task<IActionResult> Index()
    {
        var loans = await _loanService.GetAllLoansAsync();
        return View(loans);
    }

    // GET: /Loans/History/5  (loan history for a specific book)
    public async Task<IActionResult> History(int id)
    {
        var book = await _loanService.GetBookByIdAsync(id);
        if (book is null) return NotFound();

        var loans = await _loanService.GetLoansByBookIdAsync(id);

        ViewBag.Book = book;
        return View(loans);
    }

    // GET: /Loans/Checkout
    public async Task<IActionResult> Checkout()
    {
        ViewBag.Books = new SelectList(
            await _loanService.GetAvailableBooksAsync(),
            "Id", "Title");

        ViewBag.Users = new SelectList(
            await _loanService.GetAllUsersAsync(),
            "Id", "Email");

        return View();
    }

    // POST: /Loans/Checkout
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Checkout(int bookId, string userId, int? dueDays)
    {
        var result = await _loanService.CheckoutAsync(bookId, userId, dueDays);

        if (!result.Succeeded)
        {
            TempData["Error"] = result.ErrorMessage;
            return RedirectToAction(nameof(Checkout));
        }

        TempData["Success"] = $"'{result.BookTitle}' checked out to {result.UserEmail}.";
        return RedirectToAction(nameof(Index));
    }

    // POST: /Loans/Checkin/5
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Checkin(int id)
    {
        var result = await _loanService.CheckinAsync(id);

        if (result.NotFound) return NotFound();

        if (!result.Succeeded)
        {
            TempData["Error"] = result.ErrorMessage;
            return RedirectToAction(nameof(Index));
        }

        TempData["Success"] = $"'{result.BookTitle}' has been checked in.";
        return RedirectToAction(nameof(Index));
    }
}
