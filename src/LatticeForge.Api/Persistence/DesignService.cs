using LatticeForge.Api.Manufacturing;
using Microsoft.EntityFrameworkCore;

namespace LatticeForge.Api.Persistence;

public sealed class DesignService(DesignDbContext database, ManufacturingAnalysisService analysisService)
{
    public const int CurrentSchemaVersion = 1;

    public async Task<SavedDesign> CreateAsync(DesignRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        DesignEntity entity = new()
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            CreatedAt = now,
            UpdatedAt = now,
            Length = request.Parameters.Length,
            Height = request.Parameters.Height,
            Depth = request.Parameters.Depth,
            WallThickness = request.Parameters.WallThickness,
            HoleRadius = request.Parameters.HoleRadius,
            LatticeDensity = request.Parameters.LatticeDensity,
            MaterialId = request.MaterialId,
            Process = request.Process,
            SchemaVersion = CurrentSchemaVersion,
        };

        database.Designs.Add(entity);
        await database.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken)
    {
        List<DesignEntity> entities = await database.Designs
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        return entities
            .OrderByDescending(design => design.UpdatedAt)
            .ThenByDescending(design => design.CreatedAt)
            .Select(ValidateAndMap)
            .ToArray();
    }

    public async Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        DesignEntity? entity = await database.Designs.AsNoTracking().SingleOrDefaultAsync(design => design.Id == id, cancellationToken);
        return entity is null ? null : ValidateAndMap(entity);
    }

    private SavedDesign ValidateAndMap(DesignEntity entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Name) || entity.Name.Trim().Length > 80)
        {
            throw new ArgumentException("Stored design name is invalid.", nameof(entity));
        }

        if (entity.SchemaVersion != CurrentSchemaVersion)
        {
            throw new ArgumentException($"Stored design schema version must be {CurrentSchemaVersion}.", nameof(entity));
        }

        analysisService.Validate(
            new BracketParameters(entity.Length, entity.Height, entity.Depth, entity.WallThickness, entity.HoleRadius, entity.LatticeDensity),
            entity.MaterialId,
            entity.Process);
        return Map(entity);
    }

    private void ValidateRequest(DesignRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 80)
        {
            throw new ArgumentException("Design name must contain between 1 and 80 characters.", nameof(request));
        }

        if (request.SchemaVersion != CurrentSchemaVersion)
        {
            throw new ArgumentException($"Design schema version must be {CurrentSchemaVersion}.", nameof(request));
        }

        analysisService.Validate(request.Parameters, request.MaterialId, request.Process);
    }

    private static SavedDesign Map(DesignEntity entity) => new(
        entity.Id,
        entity.Name,
        entity.CreatedAt,
        entity.UpdatedAt,
        new BracketParameters(entity.Length, entity.Height, entity.Depth, entity.WallThickness, entity.HoleRadius, entity.LatticeDensity),
        entity.MaterialId,
        entity.Process,
        entity.SchemaVersion);
}
