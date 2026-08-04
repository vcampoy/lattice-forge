using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing.AnalyzeMaterials.Dtos;

public sealed record AnalyzeMaterialsRequest(
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process);
