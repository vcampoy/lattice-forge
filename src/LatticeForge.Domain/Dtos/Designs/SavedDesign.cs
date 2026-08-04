using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.Domain.Dtos.Designs;

public sealed record SavedDesign(
    Guid Id,
    string Name,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
