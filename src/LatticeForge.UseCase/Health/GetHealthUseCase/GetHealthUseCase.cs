using LatticeForge.UseCase.Health.GetHealthUseCase.Dtos;

namespace LatticeForge.UseCase.Health.GetHealthUseCase;

public interface IGetHealthUseCase
{
    GetHealthResponse Execute(GetHealthRequest request);
}

public sealed class GetHealthUseCaseImpl : IGetHealthUseCase
{
    public GetHealthResponse Execute(GetHealthRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        return new GetHealthResponse("ok", "Lattice Forge API");
    }
}
