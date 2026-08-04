using LatticeForge.UseCase.Health.GetHealth.Dtos;

namespace LatticeForge.UseCase.Health.GetHealth;

public interface IGetHealthUseCase
{
    GetHealthResponse Execute(GetHealthRequest request);
}

public sealed class GetHealthUseCase : IGetHealthUseCase
{
    public GetHealthResponse Execute(GetHealthRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        return new GetHealthResponse("ok", "Lattice Forge API");
    }
}
