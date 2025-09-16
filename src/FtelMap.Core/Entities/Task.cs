namespace FtelMap.Core.Entities;

public class Task : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public int EstimatedHours { get; set; }
    public int ActualHours { get; set; }
    
    // Foreign keys
    public Guid StepId { get; set; }
    public Guid? AssignedToId { get; set; }
    
    // Navigation properties
    public virtual Step Step { get; set; } = null!;
    public virtual User? AssignedTo { get; set; }
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum TaskStatus
{
    Todo,
    InProgress,
    Review,
    Done,
    Blocked
}