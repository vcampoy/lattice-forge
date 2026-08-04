using LatticeForge.Domain.Dtos.Designs;
using LatticeForge.Domain.Dtos.Manufacturing;
using LatticeForge.Domain.Entities;

namespace LatticeForge.Services.Mappers;

public static class DesignMapper
{
    public static SavedDesign Map(DesignEntity entity) => new(
        entity.Id,
        entity.Name,
        entity.CreatedAt,
        entity.UpdatedAt,
        new BracketParameters(
            entity.Length,
            entity.Height,
            entity.Depth,
            entity.WallThickness,
            entity.HoleRadius,
            entity.LatticeDensity),
        entity.MaterialId,
        entity.Process,
        entity.SchemaVersion);
}
