using LatticeForge.Api.Manufacturing;

namespace LatticeForge.Api.Persistence;

public sealed record DesignRequest(
    string Name,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);

public sealed record SavedDesign(
    Guid Id,
    string Name,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
