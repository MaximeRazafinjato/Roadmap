using System.ComponentModel.DataAnnotations;

namespace FtelMap.Application.DTOs;

public class CreateStepDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    [Required]
    [RegularExpression("^#[0-9A-Fa-f]{6}$", ErrorMessage = "Background color must be a valid hex color code")]
    public string BackgroundColor { get; set; } = "#3B82F6";
    
    [Required]
    [RegularExpression("^#[0-9A-Fa-f]{6}$", ErrorMessage = "Text color must be a valid hex color code")]
    public string TextColor { get; set; } = "#FFFFFF";
    
    [Required]
    public Guid OwnerId { get; set; }
}

public class UpdateStepDto : CreateStepDto
{
}

public class StepDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string BackgroundColor { get; set; } = "#3B82F6";
    public string TextColor { get; set; } = "#FFFFFF";
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
}