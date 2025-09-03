using Microsoft.EntityFrameworkCore.Storage;
using FtelMap.Core.Entities;
using FtelMap.Core.Interfaces;
using FtelMap.Infrastructure.Data;

namespace FtelMap.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    private IRepository<User>? _users;
    private IRepository<Project>? _projects;
    private IRepository<Core.Entities.Task>? _tasks;
    private IRepository<Milestone>? _milestones;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Project> Projects => _projects ??= new Repository<Project>(_context);
    public IRepository<Core.Entities.Task> Tasks => _tasks ??= new Repository<Core.Entities.Task>(_context);
    public IRepository<Milestone> Milestones => _milestones ??= new Repository<Milestone>(_context);

    public async System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async System.Threading.Tasks.Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _transaction?.Dispose();
                _context.Dispose();
            }
            _disposed = true;
        }
    }
}