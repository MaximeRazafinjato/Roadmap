using System.ComponentModel.DataAnnotations;
using FtelMap.Core.Entities;

namespace FtelMap.Application.DTOs;

public class CreateProjectDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    
    [Required]
    [Range(0, double.MaxValue)]
    public decimal Budget { get; set; }
    
    [Required]
    public Guid OwnerId { get; set; }
}

public class UpdateProjectDto : CreateProjectDto
{
}

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProjectStatus Status { get; set; }
    public decimal Budget { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
}