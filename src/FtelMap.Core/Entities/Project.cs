namespace FtelMap.Core.Entities;

public class Project : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string BackgroundColor { get; set; } = "#3B82F6"; // Default blue
    public string TextColor { get; set; } = "#FFFFFF"; // Default white
    
    // Foreign keys
    public Guid OwnerId { get; set; }
    
    // Navigation properties
    public virtual User Owner { get; set; } = null!;
}