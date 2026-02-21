using LibraryMVC.web.Models;
using Microsoft.AspNetCore.Identity;

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
            // ── Software Engineering ──
            new Book
            {
                Title = "Clean Code",
                Author = "Robert C. Martin",
                ISBN = "9780132350884",
                Category = "Software Engineering",
                Tags = "programming,best-practices,clean-code",
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
                Tags = "programming,career,software-development",
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
                Title = "Introduction to Algorithms",
                Author = "Thomas H. Cormen",
                ISBN = "9780262046305",
                Category = "Computer Science",
                Tags = "algorithms,data-structures,textbook",
                Language = "English",
                PublishYear = 2022,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "The leading textbook on algorithms, fourth edition."
            },

            // ── Productivity / Self-Help ──
            new Book
            {
                Title = "Atomic Habits",
                Author = "James Clear",
                ISBN = "9780735211292",
                Category = "Productivity",
                Tags = "habits,self-improvement,personal-development",
                Language = "English",
                PublishYear = 2018,
                TotalCopies = 4,
                AvailableCopies = 4,
                Description = "An easy & proven way to build good habits & break bad ones."
            },
            new Book
            {
                Title = "Deep Work",
                Author = "Cal Newport",
                ISBN = "9781455586691",
                Category = "Productivity",
                Tags = "focus,productivity,career",
                Language = "English",
                PublishYear = 2016,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "Rules for focused success in a distracted world."
            },
            new Book
            {
                Title = "The 7 Habits of Highly Effective People",
                Author = "Stephen R. Covey",
                ISBN = "9781982137274",
                Category = "Self-Help",
                Tags = "habits,leadership,personal-development",
                Language = "English",
                PublishYear = 2020,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "Powerful lessons in personal change. 30th Anniversary Edition."
            },

            // ── Cooking ──
            new Book
            {
                Title = "Salt, Fat, Acid, Heat",
                Author = "Samin Nosrat",
                ISBN = "9781476753836",
                Category = "Cooking",
                Tags = "cooking-fundamentals,food-science,beginner-friendly",
                Language = "English",
                PublishYear = 2017,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "Mastering the elements of good cooking. A New York Times bestseller with gorgeous illustrations."
            },
            new Book
            {
                Title = "The Food Lab",
                Author = "J. Kenji López-Alt",
                ISBN = "9780393081084",
                Category = "Cooking",
                Tags = "food-science,recipes,techniques",
                Language = "English",
                PublishYear = 2015,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "Better home cooking through science. Over 300 recipes exploring the science behind great food."
            },
            new Book
            {
                Title = "Mastering the Art of French Cooking",
                Author = "Julia Child",
                ISBN = "9780375413407",
                Category = "Cooking",
                Tags = "french-cuisine,classic,recipes,techniques",
                Language = "English",
                PublishYear = 2001,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "The classic French cookbook that has inspired generations of home cooks and professional chefs."
            },
            new Book
            {
                Title = "Ottolenghi Simple",
                Author = "Yotam Ottolenghi",
                ISBN = "9781607749165",
                Category = "Cooking",
                Tags = "mediterranean,vegetarian,quick-meals,recipes",
                Language = "English",
                PublishYear = 2018,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "130+ recipes for simple, everyday cooking with bold Mediterranean flavors."
            },
            new Book
            {
                Title = "The Joy of Cooking",
                Author = "Irma S. Rombauer",
                ISBN = "9781501169717",
                Category = "Cooking",
                Tags = "classic,reference,american-cuisine,baking",
                Language = "English",
                PublishYear = 2019,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "The fully revised and updated edition of America's most trusted cookbook for over 85 years."
            },

            // ── Fiction ──
            new Book
            {
                Title = "To Kill a Mockingbird",
                Author = "Harper Lee",
                ISBN = "9780061120084",
                Category = "Fiction",
                Tags = "classic,american-literature,justice,coming-of-age",
                Language = "English",
                PublishYear = 1960,
                TotalCopies = 4,
                AvailableCopies = 4,
                Description = "A gripping, heart-wrenching tale of racial injustice in the Deep South."
            },
            new Book
            {
                Title = "1984",
                Author = "George Orwell",
                ISBN = "9780451524935",
                Category = "Fiction",
                Tags = "dystopian,classic,political,science-fiction",
                Language = "English",
                PublishYear = 1949,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "A dystopian novel set in a totalitarian society ruled by Big Brother."
            },
            new Book
            {
                Title = "The Great Gatsby",
                Author = "F. Scott Fitzgerald",
                ISBN = "9780743273565",
                Category = "Fiction",
                Tags = "classic,american-literature,jazz-age",
                Language = "English",
                PublishYear = 1925,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "A portrait of the Jazz Age and the American Dream in all its decadence."
            },
            new Book
            {
                Title = "One Hundred Years of Solitude",
                Author = "Gabriel García Márquez",
                ISBN = "9780060883287",
                Category = "Fiction",
                Tags = "magical-realism,latin-american,classic,family-saga",
                Language = "English",
                PublishYear = 1970,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "The multi-generational story of the Buendía family in the town of Macondo."
            },

            // ── Science ──
            new Book
            {
                Title = "A Brief History of Time",
                Author = "Stephen Hawking",
                ISBN = "9780553380163",
                Category = "Science",
                Tags = "physics,cosmology,popular-science",
                Language = "English",
                PublishYear = 1998,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "From the Big Bang to black holes — a landmark book on cosmology for everyone."
            },
            new Book
            {
                Title = "Sapiens: A Brief History of Humankind",
                Author = "Yuval Noah Harari",
                ISBN = "9780062316110",
                Category = "Science",
                Tags = "anthropology,history,evolution,popular-science",
                Language = "English",
                PublishYear = 2015,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "A sweeping narrative of how Homo sapiens came to dominate the planet."
            },

            // ── History ──
            new Book
            {
                Title = "Guns, Germs, and Steel",
                Author = "Jared Diamond",
                ISBN = "9780393354324",
                Category = "History",
                Tags = "anthropology,civilization,geography,world-history",
                Language = "English",
                PublishYear = 1997,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "A Pulitzer Prize-winning exploration of why certain civilizations rose to power."
            },
            new Book
            {
                Title = "The Silk Roads",
                Author = "Peter Frankopan",
                ISBN = "9781101912379",
                Category = "History",
                Tags = "world-history,trade,civilization,asia",
                Language = "English",
                PublishYear = 2015,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "A new history of the world told through the networks that have connected civilizations for millennia."
            },

            // ── Fantasy ──
            new Book
            {
                Title = "The Hobbit",
                Author = "J.R.R. Tolkien",
                ISBN = "9780547928227",
                Category = "Fantasy",
                Tags = "adventure,classic,middle-earth,dragons",
                Language = "English",
                PublishYear = 1937,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "Bilbo Baggins embarks on an unexpected journey with a group of dwarves to reclaim their homeland."
            },
            new Book
            {
                Title = "The Name of the Wind",
                Author = "Patrick Rothfuss",
                ISBN = "9780756404741",
                Category = "Fantasy",
                Tags = "epic-fantasy,magic,adventure,storytelling",
                Language = "English",
                PublishYear = 2007,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "The tale of Kvothe — from childhood in a troupe of traveling players to years spent as a near-feral orphan."
            },

            // ── Business / Finance ──
            new Book
            {
                Title = "Thinking, Fast and Slow",
                Author = "Daniel Kahneman",
                ISBN = "9780374533557",
                Category = "Psychology",
                Tags = "behavioral-economics,decision-making,cognitive-science",
                Language = "English",
                PublishYear = 2011,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "Nobel laureate Daniel Kahneman explores the two systems that drive the way we think."
            },
            new Book
            {
                Title = "Rich Dad Poor Dad",
                Author = "Robert T. Kiyosaki",
                ISBN = "9781612681139",
                Category = "Finance",
                Tags = "personal-finance,investing,money,financial-literacy",
                Language = "English",
                PublishYear = 2017,
                TotalCopies = 3,
                AvailableCopies = 3,
                Description = "What the rich teach their kids about money that the poor and middle class do not."
            },

            // ── Health & Wellness ──
            new Book
            {
                Title = "Why We Sleep",
                Author = "Matthew Walker",
                ISBN = "9781501144325",
                Category = "Health",
                Tags = "sleep,neuroscience,wellness,popular-science",
                Language = "English",
                PublishYear = 2017,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "Unlocking the power of sleep and dreams — the new science of sleep."
            },

            // ── Non-English Book ──
            new Book
            {
                Title = "Le Petit Prince",
                Author = "Antoine de Saint-Exupéry",
                ISBN = "9782070612758",
                Category = "Fiction",
                Tags = "classic,french-literature,philosophical,children",
                Language = "French",
                PublishYear = 1943,
                TotalCopies = 2,
                AvailableCopies = 2,
                Description = "Un conte poétique et philosophique sur l'amitié, l'amour et la nature humaine."
            }
        );

        await context.SaveChangesAsync();
    }
}
