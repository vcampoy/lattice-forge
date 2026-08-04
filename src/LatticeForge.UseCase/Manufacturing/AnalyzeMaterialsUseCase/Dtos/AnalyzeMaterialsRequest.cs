using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase.Dtos;

public sealed record AnalyzeMaterialsRequest(
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process);
