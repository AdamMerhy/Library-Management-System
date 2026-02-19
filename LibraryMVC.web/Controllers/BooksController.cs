using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LibraryMVC.web.Services;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Controllers;

[Authorize]
public class BooksController : Controller
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
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
        await _bookService.DeleteBookAsync(id);
        return RedirectToAction(nameof(Index));
    }
}
