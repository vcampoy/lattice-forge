using LatticeForge.Api.Manufacturing;
using LatticeForge.Domain.Manufacturing;
using LatticeForge.UseCase.Manufacturing;

namespace LatticeForge.Api.Endpoints;

public static class ManufacturingEndpoints
{
    public static IEndpointRouteBuilder MapManufacturingEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/materials", static (IManufacturingUseCase useCase) =>
            TypedResults.Ok(useCase.Materials))
            .WithName("GetMaterials")
            .WithTags("Manufacturing")
            .WithSummary("Lists supported illustrative manufacturing materials")
            .WithDescription("Returns deterministic material profiles with explicit metric units.")
            .Produces<IReadOnlyList<MaterialProfile>>(StatusCodes.Status200OK, "application/json");

        endpoints.MapPost("/api/analyses", static (AnalysisRequest request, IManufacturingUseCase useCase) =>
            {
                try
                {
                    ManufacturingAnalysis analysis = useCase.Analyze(
                        request.Parameters,
                        request.MaterialId,
                        request.Process);
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

        return endpoints;
    }
}
