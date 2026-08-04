using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.UseCase.Designs.CreateDesign.Dtos;

public sealed record CreateDesignResponse(
    Guid Id,
    string Name,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
