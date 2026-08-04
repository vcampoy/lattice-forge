using LatticeForge.UseCase.Manufacturing.Helpers;
using LatticeForge.UseCase.Manufacturing.GetMaterialsUseCase.Dtos;

namespace LatticeForge.UseCase.Manufacturing.GetMaterialsUseCase;

public interface IGetMaterialsUseCase
{
    GetMaterialsResponse Execute(GetMaterialsRequest request);
}

public sealed class GetMaterialsUseCaseImpl : IGetMaterialsUseCase
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
