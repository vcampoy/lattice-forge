using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing.GetMaterialsUseCase.Dtos;

public sealed record GetMaterialsResponse(IReadOnlyList<GetMaterialsResponse.MaterialDto> Materials)
{
    public sealed record MaterialDto(
        string Id,
        string Name,
        ManufacturingProcess Process,
        double Density,
        double CostPerKg,
        double MinimumWallThickness,
        double DepositionRate);
}
