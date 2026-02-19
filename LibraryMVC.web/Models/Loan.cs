using System.ComponentModel.DataAnnotations;
using LibraryMVC.web.Models.Enums;

namespace LibraryMVC.web.Models;

public class Loan
{
    public int Id { get; set; }

    [Required]
    public int BookId { get; set; }
    public Book Book { get; set; } = null!;

    [Required]
    public string BorrowedByUserId { get; set; } = string.Empty;
    public ApplicationUser BorrowedByUser { get; set; } = null!;

    public DateTime BorrowedAt { get; set; } = DateTime.UtcNow;

    [Display(Name = "Due Date")]
    public DateTime? DueAt { get; set; }

    [Display(Name = "Returned Date")]
    public DateTime? ReturnedAt { get; set; }

    public LoanStatus Status { get; set; } = LoanStatus.Borrowed;
}
