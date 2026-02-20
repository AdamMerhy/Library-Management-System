using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Data;
using LibraryMVC.web.Models;
using LibraryMVC.web.ViewModels;

namespace LibraryMVC.web.Controllers;

[Authorize(Policy = "ManageUsers")]
public class AdminController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    // GET: /Admin/Users
    public async Task<IActionResult> Users()
    {
        var users = await _userManager.Users.OrderBy(u => u.Email).ToListAsync();
        var list = new List<UserRoleViewModel>();

        foreach (var user in users)
        {
            list.Add(new UserRoleViewModel
            {
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                Roles = await _userManager.GetRolesAsync(user)
            });
        }

        return View(list);
    }

    // GET: /Admin/EditRole/userId
    public async Task<IActionResult> EditRole(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var vm = new UserRoleViewModel
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = await _userManager.GetRolesAsync(user)
        };

        ViewBag.AllRoles = new[] { SeedData.AdminRole, SeedData.LibrarianRole, SeedData.MemberRole };
        return View(vm);
    }

    // POST: /Admin/EditRole
    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> EditRole(UserRoleViewModel vm)
    {
        var user = await _userManager.FindByIdAsync(vm.UserId);
        if (user is null) return NotFound();

        if (string.IsNullOrWhiteSpace(vm.SelectedRole))
        {
            TempData["Error"] = "Please select a role.";
            return RedirectToAction(nameof(EditRole), new { id = vm.UserId });
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, vm.SelectedRole);

        TempData["Success"] = $"Role for {user.Email} updated to {vm.SelectedRole}.";
        return RedirectToAction(nameof(Users));
    }
}
