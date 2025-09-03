using FtelMap.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FtelMap.Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(u => u.Id);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.PasswordHash)
                .IsRequired();

            builder.Property(u => u.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.LastName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.RefreshToken)
                .HasMaxLength(500);

            builder.Property(u => u.Role)
                .HasMaxLength(50);

            builder.HasIndex(u => u.Email)
                .IsUnique();

            builder.HasIndex(u => u.Username)
                .IsUnique();

            builder.HasMany(u => u.Projects)
                .WithOne(p => p.Owner)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.AssignedTasks)
                .WithOne(t => t.AssignedTo)
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasQueryFilter(u => !u.IsDeleted);
        }
    }
}