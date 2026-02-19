using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using LibraryMVC.web.Data;
using LibraryMVC.web.Models;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Controllers;

[Authorize(Policy = "ManageUsers")]
public class AdminController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    // GET: /Admin/Users
    public async Task<IActionResult> Users()
    {
        var users = _userManager.Users.ToList();
        var models = new List<UserRoleViewModel>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            models.Add(new UserRoleViewModel
            {
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                CurrentRoles = roles.ToList()
            });
        }

        ViewBag.AllRoles = _roleManager.Roles.Select(r => r.Name).ToList();
        return View(models);
    }

    // POST: /Admin/AssignRole
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> AssignRole(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, role);

        TempData["Success"] = $"Role '{role}' assigned to {user.Email}.";
        return RedirectToAction(nameof(Users));
    }
}
