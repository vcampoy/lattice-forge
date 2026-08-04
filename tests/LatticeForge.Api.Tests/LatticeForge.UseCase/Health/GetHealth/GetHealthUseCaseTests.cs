using LatticeForge.UseCase.Health.GetHealth;
using LatticeForge.UseCase.Health.GetHealth.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Health;

public sealed class GetHealthUseCaseTests
{
    [Fact]
    public void Execute_should_return_service_status()
    {
        GetHealthUseCase useCase = new();

        GetHealthResponse result = useCase.Execute(new GetHealthRequest());

        Assert.Equal("ok", result.Status);
        Assert.Equal("Lattice Forge API", result.Service);
    }
}
