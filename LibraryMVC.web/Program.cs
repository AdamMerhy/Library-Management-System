using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Data;
using LibraryMVC.web.Models;
using LibraryMVC.web.Repositories;
using LibraryMVC.web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.SignIn.RequireConfirmedAccount = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Google SSO
var googleSection = builder.Configuration.GetSection("Authentication:Google");
if (!string.IsNullOrEmpty(googleSection["ClientId"]))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleSection["ClientId"]!;
            options.ClientSecret = googleSection["ClientSecret"]!;
        });
}

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ManageBooks", policy =>
        policy.RequireRole(SeedData.AdminRole, SeedData.LibrarianRole));

    options.AddPolicy("ManageLoans", policy =>
        policy.RequireRole(SeedData.AdminRole, SeedData.LibrarianRole));

    options.AddPolicy("ManageUsers", policy =>
        policy.RequireRole(SeedData.AdminRole));
});

builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<ILoanRepository, LoanRepository>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<ILoanService, LoanService>();

// Groq-powered AI search
builder.Services.AddHttpClient<IAiSearchInterpreter, GroqAiSearchInterpreter>(client =>
{
    client.BaseAddress = new Uri("https://api.groq.com/");
    client.DefaultRequestHeaders.Authorization =
        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", builder.Configuration["Groq:ApiKey"]);
    client.DefaultRequestHeaders.Accept.Add(
        new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
});

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Seed roles and dev data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();
    await SeedData.InitialiseAsync(scope.ServiceProvider);
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();