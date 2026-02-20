using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace LibraryMVC.web.ViewModels;

public class BookCreateEditViewModel
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Author { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? ISBN { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(500)]
    public string? Tags { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Display(Name = "Publish Year")]
    [MaxCurrentYear(1000, ErrorMessage = "Publish year is invalid.")]
    public int? PublishYear { get; set; }

    [MaxLength(50)]
    public string? Language { get; set; }

    [MaxLength(100), Display(Name = "Shelf Location")]
    public string? LocationShelf { get; set; }

    [MaxLength(500), Display(Name = "Cover Image URL")]
    [Url(ErrorMessage = "Please enter a valid URL.")]
    public string? CoverImageUrl { get; set; }

    [Display(Name = "Upload Cover Image")]
    public IFormFile? CoverImage { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Total copies must be at least 1."), Display(Name = "Total Copies")]
    public int TotalCopies { get; set; } = 1;

    [Range(0, int.MaxValue), Display(Name = "Available Copies")]
    public int AvailableCopies { get; set; } = 1;
}
