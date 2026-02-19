namespace LibraryMVC.web.Services;

public interface IAiSearchInterpreter
{
    Task<AiSearchResult> InterpretAsync(string userPrompt, CancellationToken ct = default);
}
