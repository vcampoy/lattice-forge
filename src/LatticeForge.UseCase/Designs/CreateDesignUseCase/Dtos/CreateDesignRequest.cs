using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Designs.CreateDesignUseCase.Dtos;

public sealed record CreateDesignRequest(
    string Name,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
