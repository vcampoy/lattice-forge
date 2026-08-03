using LatticeForge.Api;
using System.Text.Json.Serialization;
using LatticeForge.Api.Manufacturing;
using LatticeForge.Api.Persistence;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ManufacturingAnalysisService>(_ => new(MaterialCatalogue.All));
string designConnection = builder.Configuration.GetConnectionString("Designs")
    ?? $"Data Source={Path.Combine(AppContext.BaseDirectory, "latticeforge.db")}";
builder.Services.AddDbContext<DesignDbContext>(options => options.UseSqlite(designConnection));
builder.Services.AddScoped<DesignService>();
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

WebApplication app = builder.Build();

using (IServiceScope scope = app.Services.CreateScope())
{
    // Local demo bootstrap: EnsureCreated is intentionally simple and deterministic. Replace it with
    // reviewed migrations before using this service in a long-lived production database.
    scope.ServiceProvider.GetRequiredService<DesignDbContext>().Database.EnsureCreated();
}

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

app.MapPost("/api/designs", static async (DesignRequest request, DesignService service, CancellationToken cancellationToken) =>
    {
        try
        {
            SavedDesign design = await service.CreateAsync(request, cancellationToken);
            return Results.Created($"/api/designs/{design.Id}", design);
        }
        catch (ArgumentException exception)
        {
            return Results.Problem(
                title: "Design request is invalid.",
                detail: exception.Message,
                statusCode: StatusCodes.Status400BadRequest,
                type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
        }
    })
    .WithName("CreateDesign")
    .WithTags("Designs")
    .Produces<SavedDesign>(StatusCodes.Status201Created, "application/json")
    .ProducesProblem(StatusCodes.Status400BadRequest);

app.MapGet("/api/designs", static async (DesignService service, CancellationToken cancellationToken) =>
    {
        try
        {
            IReadOnlyList<SavedDesign> designs = await service.ListAsync(cancellationToken);
            return Results.Ok(designs);
        }
        catch (ArgumentException exception)
        {
            return Results.Problem(
                title: "Stored design is invalid.",
                detail: exception.Message,
                statusCode: StatusCodes.Status400BadRequest,
                type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
        }
    })
    .WithName("GetDesigns")
    .WithTags("Designs")
    .Produces<IReadOnlyList<SavedDesign>>(StatusCodes.Status200OK, "application/json")
    .ProducesProblem(StatusCodes.Status400BadRequest);

app.MapGet("/api/designs/{id:guid}", static async (Guid id, DesignService service, CancellationToken cancellationToken) =>
    {
        try
        {
            SavedDesign? design = await service.GetAsync(id, cancellationToken);
            return design is null ? Results.NotFound() : Results.Ok(design);
        }
        catch (ArgumentException exception)
        {
            return Results.Problem(
                title: "Stored design is invalid.",
                detail: exception.Message,
                statusCode: StatusCodes.Status400BadRequest,
                type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
        }
    })
    .WithName("GetDesign")
    .WithTags("Designs")
    .Produces<SavedDesign>(StatusCodes.Status200OK, "application/json")
    .Produces(StatusCodes.Status404NotFound)
    .ProducesProblem(StatusCodes.Status400BadRequest);

app.Run();

public partial class Program
{
}
