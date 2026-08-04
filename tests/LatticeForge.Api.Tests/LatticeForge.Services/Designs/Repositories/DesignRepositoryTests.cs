using LatticeForge.Domain.Designs;
using LatticeForge.Domain.Manufacturing;
using LatticeForge.Infrastructure.Persistence;
using LatticeForge.Services.Designs.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LatticeForge.Api.Tests.LatticeForge.Services.Designs.Repositories;

public sealed class DesignRepositoryTests
{
    private static readonly BracketParameters Parameters = new(120, 80, 40, 4, 8, 0.5);

    [Fact]
    public async Task CreateAsync_should_round_trip_domain_design_when_database_is_available()
    {
        string databasePath = Path.Combine(Path.GetTempPath(), $"lattice-forge-repository-{Guid.NewGuid():N}.db");
        DbContextOptions<DesignDbContext> options = new DbContextOptionsBuilder<DesignDbContext>()
            .UseSqlite($"Data Source={databasePath}")
            .Options;

        try
        {
            await using DesignDbContext context = new(options);
            await context.Database.EnsureCreatedAsync(CancellationToken.None);
            DesignRepository repository = new(context);
            DateTimeOffset now = DateTimeOffset.UtcNow;
            SavedDesign design = new(
                Guid.NewGuid(), "Bracket", now, now, Parameters, "aluminum-sls", ManufacturingProcess.Sls, 1);

            await repository.CreateAsync(design, CancellationToken.None);
            SavedDesign? restored = await repository.GetAsync(design.Id, CancellationToken.None);

            Assert.Equal(design, restored);
        }
        finally
        {
            try
            {
                File.Delete(databasePath);
            }
            catch (IOException)
            {
                // SQLite can release its native handle after the test; the unique temp file is safe to leave.
            }
        }
    }
}
