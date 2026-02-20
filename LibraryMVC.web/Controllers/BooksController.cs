using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LibraryMVC.web.Services;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Controllers;

[Authorize]
public class BooksController : Controller
{
    private readonly IBookService _bookService;
    private readonly ILoanService _loanService;
    private readonly IWebHostEnvironment _env;

    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public BooksController(IBookService bookService, ILoanService loanService, IWebHostEnvironment env)
    {
        _bookService = bookService;
        _loanService = loanService;
        _env = env;
    }

    // GET: /Books
    [AllowAnonymous]
    public async Task<IActionResult> Index(BookListViewModel vm)
    {
        vm = await _bookService.GetFilteredBooksAsync(vm);
        return View(vm);
    }

    // GET: /Books/Details/5
    [AllowAnonymous]
    public async Task<IActionResult> Details(int? id)
    {
        if (id is null) return NotFound();
        var book = await _bookService.GetBookDetailsAsync(id.Value);
        if (book is null) return NotFound();
        return View(book);
    }

    // POST: /Books/Borrow/5
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Borrow(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Challenge();

        var result = await _loanService.CheckoutAsync(id, userId, dueDays: 14);

        if (!result.Succeeded)
        {
            TempData["Error"] = result.ErrorMessage;
            return RedirectToAction(nameof(Details), new { id });
        }

        TempData["Success"] = $"You have borrowed '{result.BookTitle}'. Due in 14 days.";
        return RedirectToAction(nameof(MyLoans));
    }

    // GET: /Books/MyLoans
    public async Task<IActionResult> MyLoans()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Challenge();

        var loans = await _loanService.GetLoansByUserIdAsync(userId);
        return View(loans);
    }

    // GET: /Books/Create
    [Authorize(Policy = "ManageBooks")]
    public IActionResult Create()
    {
        return View(new BookCreateEditViewModel());
    }

    // POST: /Books/Create
    [HttpPost, ValidateAntiForgeryToken]
    [Authorize(Policy = "ManageBooks")]
    public async Task<IActionResult> Create(BookCreateEditViewModel vm)
    {
        if (vm.AvailableCopies > vm.TotalCopies)
            ModelState.AddModelError(nameof(vm.AvailableCopies), "Available copies cannot exceed total copies.");

        if (!ModelState.IsValid) return View(vm);

        // Handle file upload — takes priority over URL
        if (vm.CoverImage is not null)
        {
            var (path, error) = await SaveCoverImageAsync(vm.CoverImage);
            if (error is not null)
            {
                ModelState.AddModelError(nameof(vm.CoverImage), error);
                return View(vm);
            }
            vm.CoverImageUrl = path;
        }

        await _bookService.CreateBookAsync(vm);
        return RedirectToAction(nameof(Index));
    }

    // GET: /Books/Edit/5
    [Authorize(Policy = "ManageBooks")]
    public async Task<IActionResult> Edit(int? id)
    {
        if (id is null) return NotFound();
        var vm = await _bookService.GetBookForEditAsync(id.Value);
        if (vm is null) return NotFound();
        return View(vm);
    }

    // POST: /Books/Edit/5
    [HttpPost, ValidateAntiForgeryToken]
    [Authorize(Policy = "ManageBooks")]
    public async Task<IActionResult> Edit(int id, BookCreateEditViewModel vm)
    {
        if (id != vm.Id) return NotFound();

        if (vm.AvailableCopies > vm.TotalCopies)
            ModelState.AddModelError(nameof(vm.AvailableCopies), "Available copies cannot exceed total copies.");

        if (!ModelState.IsValid) return View(vm);

        // Handle file upload — replace existing cover
        if (vm.CoverImage is not null)
        {
            var (path, error) = await SaveCoverImageAsync(vm.CoverImage);
            if (error is not null)
            {
                ModelState.AddModelError(nameof(vm.CoverImage), error);
                return View(vm);
            }

            // Delete the old local file if it exists
            DeleteLocalCover(vm.CoverImageUrl);
            vm.CoverImageUrl = path;
        }

        if (!await _bookService.UpdateBookAsync(id, vm))
            return NotFound();

        return RedirectToAction(nameof(Index));
    }

    // GET: /Books/Delete/5
    [Authorize(Policy = "ManageBooks")]
    public async Task<IActionResult> Delete(int? id)
    {
        if (id is null) return NotFound();
        var book = await _bookService.GetBookForDeleteAsync(id.Value);
        if (book is null) return NotFound();
        return View(book);
    }

    // POST: /Books/Delete/5
    [HttpPost, ActionName("Delete"), ValidateAntiForgeryToken]
    [Authorize(Policy = "ManageBooks")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        // Grab the book to clean up its cover file
        var book = await _bookService.GetBookForDeleteAsync(id);
        var result = await _bookService.DeleteBookAsync(id);

        if (result.NotFound) return NotFound();

        if (!result.Succeeded)
        {
            TempData["Error"] = result.ErrorMessage;
            return RedirectToAction(nameof(Index));
        }

        // Remove local cover file after successful delete
        DeleteLocalCover(book?.CoverImageUrl);

        TempData["Success"] = "Book deleted successfully.";
        return RedirectToAction(nameof(Index));
    }

    // ── helper methods ──────────────────────────────────────────

    private async Task<(string? Path, string? Error)> SaveCoverImageAsync(IFormFile file)
    {
        if (file.Length > MaxFileSize)
            return (null, "Cover image must be 5 MB or smaller.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return (null, "Only .jpg, .jpeg, .png, .gif, and .webp files are allowed.");

        var uploadsDir = Path.Combine(_env.WebRootPath, "assets", "covers");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return ($"/assets/covers/{fileName}", null);
    }

    private void DeleteLocalCover(string? coverUrl)
    {
        if (string.IsNullOrWhiteSpace(coverUrl) || !coverUrl.StartsWith("/assets/covers/"))
            return;

        var fullPath = Path.Combine(_env.WebRootPath, coverUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);
    }
}
