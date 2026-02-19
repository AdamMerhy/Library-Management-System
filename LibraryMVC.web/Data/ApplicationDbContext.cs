using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using LibraryMVC.web.Models;

namespace LibraryMVC.web.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Book> Books => Set<Book>();
    public DbSet<Loan> Loans => Set<Loan>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Book>(b =>
        {
            b.HasIndex(e => e.Title);
            b.HasIndex(e => e.Author);
            b.HasIndex(e => e.ISBN);
            b.HasIndex(e => e.Category);
        });

        builder.Entity<Loan>(l =>
        {
            l.HasOne(e => e.Book)
             .WithMany()
             .HasForeignKey(e => e.BookId)
             .OnDelete(DeleteBehavior.Restrict);

            l.HasOne(e => e.BorrowedByUser)
             .WithMany()
             .HasForeignKey(e => e.BorrowedByUserId)
             .OnDelete(DeleteBehavior.Restrict);

            l.HasIndex(e => e.BookId);
            l.HasIndex(e => e.BorrowedByUserId);
        });
    }
}
