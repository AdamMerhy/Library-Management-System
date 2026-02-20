namespace LibraryMVC.web.ViewModels;

public class UserRoleViewModel
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public IList<string> Roles { get; set; } = new List<string>();
    public string? SelectedRole { get; set; }
}
