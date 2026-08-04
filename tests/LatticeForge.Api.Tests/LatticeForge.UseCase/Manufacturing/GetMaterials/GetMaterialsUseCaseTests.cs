using LatticeForge.Domain.Dtos.Manufacturing;
using LatticeForge.UseCase.Manufacturing.GetMaterials;
using LatticeForge.UseCase.Manufacturing.GetMaterials.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Manufacturing;

public sealed class GetMaterialsUseCaseTests
{
    private static readonly GetMaterialsResponse.MaterialDto[] ExpectedCatalogue =
    [
        new("aluminum-sls", "Aluminium PA", ManufacturingProcess.Sls, 1.04, 68, 1.2, 7.5),
        new("resin-sla", "Clear Resin", ManufacturingProcess.Sla, 1.1, 92, 0.8, 2.2),
        new("titanium-lpbf", "Titanium Ti-6Al-4V", ManufacturingProcess.MetalLpbf, 4.43, 185, 0.6, 1.1)
    ];

    [Fact]
    public void Execute_should_return_canonical_catalogue_when_requested()
    {
        GetMaterialsUseCase useCase = new();

        GetMaterialsResponse result = useCase.Execute(new GetMaterialsRequest());

        Assert.Equal(ExpectedCatalogue, result.Materials);
    }
}
