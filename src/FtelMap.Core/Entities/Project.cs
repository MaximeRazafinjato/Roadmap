namespace FtelMap.Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Planning;
    public decimal Budget { get; set; }
    
    // Foreign keys
    public Guid OwnerId { get; set; }
    
    // Navigation properties
    public virtual User Owner { get; set; } = null!;
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    public virtual ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
}

public enum ProjectStatus
{
    Planning,
    InProgress,
    OnHold,
    Completed,
    Cancelled
}