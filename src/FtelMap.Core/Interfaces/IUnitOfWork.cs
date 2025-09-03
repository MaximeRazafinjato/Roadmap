using FtelMap.Core.Entities;

namespace FtelMap.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Project> Projects { get; }
    IRepository<Entities.Task> Tasks { get; }
    IRepository<Milestone> Milestones { get; }
    
    System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}