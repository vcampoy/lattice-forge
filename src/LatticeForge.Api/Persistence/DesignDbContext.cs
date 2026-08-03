using Microsoft.EntityFrameworkCore;

namespace LatticeForge.Api.Persistence;

public sealed class DesignDbContext(DbContextOptions<DesignDbContext> options) : DbContext(options)
{
    public DbSet<DesignEntity> Designs => Set<DesignEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DesignEntity>(entity =>
        {
            entity.HasKey(design => design.Id);
            entity.Property(design => design.Name).HasMaxLength(80).IsRequired();
            entity.Property(design => design.MaterialId).HasMaxLength(120).IsRequired();
            entity.Property(design => design.Process).HasConversion<string>().IsRequired();
            entity.HasIndex(design => design.UpdatedAt);
        });
    }
}
