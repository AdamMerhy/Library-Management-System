using System.ComponentModel.DataAnnotations;

namespace LibraryMVC.web.ViewModels;

public class MaxCurrentYearAttribute : ValidationAttribute
{
    private readonly int _minYear;

    public MaxCurrentYearAttribute(int minYear = 1000)
    {
        _minYear = minYear;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is int year)
        {
            if (year < _minYear)
                return new ValidationResult($"Year must be {_minYear} or later.");

            if (year > DateTime.UtcNow.Year)
                return new ValidationResult($"Year cannot exceed {DateTime.UtcNow.Year}.");
        }

        return ValidationResult.Success;
    }
}