using FtelMap.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FtelMap.Infrastructure.Data;

public static class DataSeeder
{
    public static async System.Threading.Tasks.Task SeedAsync(ApplicationDbContext context)
    {
        // Only seed if database can connect
        if (!await context.Database.CanConnectAsync())
        {
            return;
        }

        // Seed users first and save them
        await SeedUsers(context);
        
        // Then seed projects
        await SeedProjects(context);
    }

    private static async System.Threading.Tasks.Task SeedUsers(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync())
        {
            return; // Data already exists
        }

        var users = new List<User>
        {
            new User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Email = "admin@ftelmap.com",
                Username = "admin",
                FirstName = "Admin",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                IsActive = true,
                Role = "Admin"
            },
            new User
            {
                Id = Guid.NewGuid(),
                Email = "john.doe@ftelmap.com",
                Username = "john.doe",
                FirstName = "John",
                LastName = "Doe",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                IsActive = true,
                Role = "User"
            },
            new User
            {
                Id = Guid.NewGuid(),
                Email = "jane.smith@ftelmap.com",
                Username = "jane.smith",
                FirstName = "Jane",
                LastName = "Smith",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                IsActive = true,
                Role = "User"
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync(); // Save users immediately
    }

    private static async System.Threading.Tasks.Task SeedProjects(ApplicationDbContext context)
    {
        if (await context.Projects.AnyAsync())
        {
            return; // Data already exists
        }

        var adminUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        var projects = new List<Project>
        {
            new Project
            {
                Id = Guid.NewGuid(),
                Title = "Website Redesign",
                Description = "Complete overhaul of the company website with modern design and improved UX",
                StartDate = DateTime.UtcNow.AddMonths(-2),
                EndDate = DateTime.UtcNow.AddMonths(4),
                BackgroundColor = "#3B82F6", // Blue
                TextColor = "#FFFFFF",
                Position = TimelinePosition.Top,
                OwnerId = adminUserId
            },
            new Project
            {
                Id = Guid.NewGuid(),
                Title = "Mobile App Development",
                Description = "Native mobile application for iOS and Android platforms",
                StartDate = DateTime.UtcNow.AddMonths(-1),
                EndDate = DateTime.UtcNow.AddMonths(6),
                BackgroundColor = "#10B981", // Green
                TextColor = "#FFFFFF",
                Position = TimelinePosition.Bottom,
                OwnerId = adminUserId
            },
            new Project
            {
                Id = Guid.NewGuid(),
                Title = "Data Migration Project",
                Description = "Migrate legacy database to new cloud-based infrastructure",
                StartDate = DateTime.UtcNow.AddMonths(-3),
                EndDate = DateTime.UtcNow.AddMonths(-1),
                BackgroundColor = "#8B5CF6", // Purple
                TextColor = "#FFFFFF",
                Position = TimelinePosition.Top,
                OwnerId = adminUserId
            }
        };

        await context.Projects.AddRangeAsync(projects);
        await context.SaveChangesAsync(); // Save projects
    }
}