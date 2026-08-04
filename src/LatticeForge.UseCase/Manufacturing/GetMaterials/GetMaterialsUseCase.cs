using LatticeForge.UseCase.Manufacturing.Helpers;
using LatticeForge.UseCase.Manufacturing.GetMaterials.Dtos;

namespace LatticeForge.UseCase.Manufacturing.GetMaterials;

public interface IGetMaterialsUseCase
{
    GetMaterialsResponse Execute(GetMaterialsRequest request);
}

public sealed class GetMaterialsUseCase : IGetMaterialsUseCase
{
    public GetMaterialsResponse Execute(GetMaterialsRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        GetMaterialsResponse.MaterialDto[] materials = MaterialCatalogueHelper.GetMaterials()
            .Select(material => new GetMaterialsResponse.MaterialDto(
                material.Id,
                material.Name,
                material.Process,
                material.Density,
                material.CostPerKg,
                material.MinimumWallThickness,
                material.DepositionRate))
            .ToArray();

        return new GetMaterialsResponse(materials);
    }
}
