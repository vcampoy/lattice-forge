using LatticeForge.Api;
using System.Text.Json.Serialization;
using LatticeForge.Api.Manufacturing;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ManufacturingAnalysisService>(_ => new(MaterialCatalogue.All));
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

WebApplication app = builder.Build();

app.MapGet("/api/health", static () =>
    TypedResults.Ok(new HealthResponse("ok", "Lattice Forge API")))
    .WithName("GetHealth")
    .WithSummary("Reports API availability");

app.MapGet("/api/materials", static () => TypedResults.Ok(MaterialCatalogue.All))
    .WithName("GetMaterials")
    .WithTags("Manufacturing")
    .WithSummary("Lists supported illustrative manufacturing materials")
    .WithDescription("Returns deterministic material profiles with explicit metric units.")
    .Produces<MaterialProfile[]>(StatusCodes.Status200OK, "application/json");

app.MapPost("/api/analyses", static (AnalysisRequest request, ManufacturingAnalysisService service) =>
    {
        try
        {
            ManufacturingAnalysis analysis = service.Analyze(request.Parameters, request.MaterialId, request.Process);
            return Results.Ok(analysis);
        }
        catch (ArgumentException exception)
        {
            return Results.Problem(
                title: "Manufacturing analysis request is invalid.",
                detail: exception.Message,
                statusCode: StatusCodes.Status400BadRequest,
                type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
        }
    })
    .WithName("CreateManufacturingAnalysis")
    .WithTags("Manufacturing")
    .WithSummary("Calculates an illustrative manufacturing analysis")
    .WithDescription("Calculates deterministic volume, weight, cost, time, and printability estimates using millimetre and metric material inputs.")
    .Produces<ManufacturingAnalysis>(StatusCodes.Status200OK, "application/json")
    .ProducesProblem(StatusCodes.Status400BadRequest);

app.Run();

public partial class Program
{
}
