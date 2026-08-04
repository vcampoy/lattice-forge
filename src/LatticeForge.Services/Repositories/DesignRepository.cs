using LatticeForge.Domain.Entities;
using LatticeForge.Domain.Dtos.Designs;
using LatticeForge.Domain.Repositories;
using LatticeForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using LatticeForge.Services.Mappers;

namespace LatticeForge.Services.Repositories;

public sealed class DesignRepository(DesignDbContext database) : IDesignRepository
{
    public async Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken)
    {
        database.Designs.Add(Map(design));
        await database.SaveChangesAsync(cancellationToken);
        return design;
    }

    public async Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken)
    {
        List<DesignEntity> entities = await database.Designs
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        return entities.Select(DesignMapper.Map).ToArray();
    }

    public async Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        DesignEntity? entity = await database.Designs
            .AsNoTracking()
            .SingleOrDefaultAsync(design => design.Id == id, cancellationToken);
        return entity is null ? null : DesignMapper.Map(entity);
    }

    private static DesignEntity Map(SavedDesign design) => new()
    {
        Id = design.Id,
        Name = design.Name,
        CreatedAt = design.CreatedAt,
        UpdatedAt = design.UpdatedAt,
        Length = design.Parameters.Length,
        Height = design.Parameters.Height,
        Depth = design.Parameters.Depth,
        WallThickness = design.Parameters.WallThickness,
        HoleRadius = design.Parameters.HoleRadius,
        LatticeDensity = design.Parameters.LatticeDensity,
        MaterialId = design.MaterialId,
        Process = design.Process,
        SchemaVersion = design.SchemaVersion
    };

}
