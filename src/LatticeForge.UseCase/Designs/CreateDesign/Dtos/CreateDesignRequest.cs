using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.UseCase.Designs.CreateDesign.Dtos;

public sealed record CreateDesignRequest(
    string Name,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
