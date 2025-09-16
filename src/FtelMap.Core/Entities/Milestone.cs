namespace FtelMap.Core.Entities;

public class Milestone : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public bool IsCompleted { get; set; }
    
    // Foreign keys
    public Guid StepId { get; set; }
    
    // Navigation properties
    public virtual Step Step { get; set; } = null!;
}