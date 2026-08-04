using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Designs.CreateDesignUseCase.Dtos;

public sealed record CreateDesignResponse(
    Guid Id,
    string Name,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
