using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LibraryMVC.web.Services;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Controllers;

[Authorize]
public class SearchController : Controller
{
    private readonly IAiSearchInterpreter _aiInterpreter;
    private readonly IBookService _bookService;

    public SearchController(IAiSearchInterpreter aiInterpreter, IBookService bookService)
    {
        _aiInterpreter = aiInterpreter;
        _bookService = bookService;
    }

    // GET: /Search/Ai
    public IActionResult Ai()
    {
        return View(new AiSearchViewModel());
    }

    // POST: /Search/Ai
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Ai(AiSearchViewModel vm)
    {
        if (string.IsNullOrWhiteSpace(vm.Prompt))
        {
            ModelState.AddModelError(nameof(vm.Prompt), "Please enter a search query.");
            return View(vm);
        }

        var result = await _aiInterpreter.InterpretAsync(vm.Prompt);
        vm.ParsedFilters = result.Filters;
        vm.Explanation = result.Explanation;
        vm.UsedFallback = result.UsedFallback;

        vm.Results = await _bookService.SearchByFiltersAsync(result.Filters);

        return View(vm);
    }
}
