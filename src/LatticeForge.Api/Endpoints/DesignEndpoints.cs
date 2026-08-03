using LatticeForge.Api.Designs;
using LatticeForge.Domain.Designs;
using LatticeForge.UseCase.Designs;

namespace LatticeForge.Api.Endpoints;

public static class DesignEndpoints
{
    public static IEndpointRouteBuilder MapDesignEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/designs", static async (
            DesignRequest request,
            IDesignUseCase useCase,
            CancellationToken cancellationToken) =>
            {
                try
                {
                    SavedDesign design = await useCase.CreateAsync(request.ToCommand(), cancellationToken);
                    return Results.Created($"/api/designs/{design.Id}", design);
                }
                catch (ArgumentException exception)
                {
                    return InvalidDesign("Design request is invalid.", exception);
                }
            })
            .WithName("CreateDesign")
            .WithTags("Designs")
            .Produces<SavedDesign>(StatusCodes.Status201Created, "application/json")
            .ProducesProblem(StatusCodes.Status400BadRequest);

        endpoints.MapGet("/api/designs", static async (
            IDesignUseCase useCase,
            CancellationToken cancellationToken) =>
            {
                try
                {
                    IReadOnlyList<SavedDesign> designs = await useCase.ListAsync(cancellationToken);
                    return Results.Ok(designs);
                }
                catch (ArgumentException exception)
                {
                    return InvalidDesign("Stored design is invalid.", exception);
                }
            })
            .WithName("GetDesigns")
            .WithTags("Designs")
            .Produces<IReadOnlyList<SavedDesign>>(StatusCodes.Status200OK, "application/json")
            .ProducesProblem(StatusCodes.Status400BadRequest);

        endpoints.MapGet("/api/designs/{id:guid}", static async (
            Guid id,
            IDesignUseCase useCase,
            CancellationToken cancellationToken) =>
            {
                try
                {
                    SavedDesign? design = await useCase.GetAsync(id, cancellationToken);
                    return design is null ? Results.NotFound() : Results.Ok(design);
                }
                catch (ArgumentException exception)
                {
                    return InvalidDesign("Stored design is invalid.", exception);
                }
            })
            .WithName("GetDesign")
            .WithTags("Designs")
            .Produces<SavedDesign>(StatusCodes.Status200OK, "application/json")
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        return endpoints;
    }

    private static IResult InvalidDesign(string title, ArgumentException exception) =>
        Results.Problem(
            title: title,
            detail: exception.Message,
            statusCode: StatusCodes.Status400BadRequest,
            type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
}
