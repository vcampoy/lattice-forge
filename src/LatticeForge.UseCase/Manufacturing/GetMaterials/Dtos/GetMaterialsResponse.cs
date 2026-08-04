using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing.GetMaterials.Dtos;

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
