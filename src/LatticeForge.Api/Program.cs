using LatticeForge.Api;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
WebApplication app = builder.Build();

app.MapGet("/api/health", static () =>
    TypedResults.Ok(new HealthResponse("ok", "Lattice Forge API")))
    .WithName("GetHealth")
    .WithSummary("Reports API availability");

app.Run();

public partial class Program
{
}
