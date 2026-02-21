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

    // GET: /Search/Ai  or  /Search/Ai?prompt=french+food+books
    public async Task<IActionResult> Ai(string? prompt)
    {
        var vm = new AiSearchViewModel { Prompt = prompt };

        if (!string.IsNullOrWhiteSpace(prompt))
        {
            var result = await _aiInterpreter.InterpretAsync(prompt);
            vm.ParsedFilters = result.Filters;
            vm.Explanation = result.Explanation;
            vm.UsedFallback = result.UsedFallback;
            vm.Results = await _bookService.SearchByFiltersAsync(result.Filters);
        }

        return View(vm);
    }
}
