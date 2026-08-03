using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.Domain.Designs;

public sealed record SavedDesign(
    Guid Id,
    string Name,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
