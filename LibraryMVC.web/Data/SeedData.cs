using Microsoft.AspNetCore.Identity;
using LibraryMVC.web.Models;

namespace LibraryMVC.web.Data;

public static class SeedData
{
    public const string AdminRole = "Admin";
    public const string LibrarianRole = "Librarian";
    public const string MemberRole = "Member";

    public static async Task InitialiseAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        string[] roles = { AdminRole, LibrarianRole, MemberRole };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var env = services.GetRequiredService<IWebHostEnvironment>();
        if (env.IsDevelopment())
        {
            await SeedAdminUserAsync(services);
            await SeedSampleBooksAsync(services);
        }
    }

    private static async Task SeedAdminUserAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        const string adminEmail = "admin@library.local";

        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Admin",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, AdminRole);
            }
        }
    }

    private static async Task SeedSampleBooksAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        if (context.Books.Any()) return;

        context.Books.AddRange(
            new Book
            {
                Title = "Clean Code",
                Author = "Robert C. Martin",
                ISBN = "9780132350884",
                Category = "Software Engineering",
                Tags = "programming,best-practices",
                Language = "English",
                PublishYear = 2008,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "A handbook of agile software craftsmanship."
            },
            new Book
            {
                Title = "The Pragmatic Programmer",
                Author = "Andrew Hunt, David Thomas",
                ISBN = "9780135957059",
                Category = "Software Engineering",
                Tags = "programming,career",
                Language = "English",
                PublishYear = 2019,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "Your journey to mastery. 20th Anniversary Edition."
            },
            new Book
            {
                Title = "Designing Data-Intensive Applications",
                Author = "Martin Kleppmann",
                ISBN = "9781449373320",
                Category = "Databases",
                Tags = "distributed-systems,databases,architecture",
                Language = "English",
                PublishYear = 2017,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "The big ideas behind reliable, scalable, and maintainable systems."
            },
            new Book
            {
                Title = "Atomic Habits",
                Author = "James Clear",
                ISBN = "9780735211292",
                Category = "Productivity",
                Tags = "habits,self-improvement",
                Language = "English",
                PublishYear = 2018,
                TotalCopies = 4,
                AvailableCopies = 4,
                Description = "An easy & proven way to build good habits & break bad ones."
            },
            new Book
            {
                Title = "Introduction to Algorithms",
                Author = "Thomas H. Cormen",
                ISBN = "9780262046305",
                Category = "Computer Science",
                Tags = "algorithms,data-structures",
                Language = "English",
                PublishYear = 2022,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "The leading textbook on algorithms, fourth edition."
            }
        );

        await context.SaveChangesAsync();
    }
}
