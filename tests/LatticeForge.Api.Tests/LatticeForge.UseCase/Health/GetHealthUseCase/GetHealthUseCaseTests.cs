using LatticeForge.UseCase.Health.GetHealthUseCase;
using LatticeForge.UseCase.Health.GetHealthUseCase.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Health;

public sealed class GetHealthUseCaseTests
{
    [Fact]
    public void Execute_should_return_service_status()
    {
        GetHealthUseCaseImpl useCase = new();

        GetHealthResponse result = useCase.Execute(new GetHealthRequest());

        Assert.Equal("ok", result.Status);
        Assert.Equal("Lattice Forge API", result.Service);
    }
}
