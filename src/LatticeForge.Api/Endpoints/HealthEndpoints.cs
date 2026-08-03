namespace LatticeForge.Api.Endpoints;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/health", static () =>
            TypedResults.Ok(new HealthResponse("ok", "Lattice Forge API")))
            .WithName("GetHealth")
            .WithSummary("Reports API availability");

        return endpoints;
    }
}
