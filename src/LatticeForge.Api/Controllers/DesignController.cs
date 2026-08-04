using LatticeForge.Api.Designs;
using LatticeForge.Domain.Designs;
using LatticeForge.UseCase.Designs;
using Microsoft.AspNetCore.Mvc;

namespace LatticeForge.Api.Controllers;

[ApiController]
[Route("api/designs")]
public sealed class DesignController(
    IDesignUseCase useCase) : ControllerBase
{
    [HttpPost(Name = "CreateDesign")]
    [ProducesResponseType(typeof(SavedDesign), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SavedDesign>> CreateDesign(
        [FromBody] DesignRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            SavedDesign design = await useCase.CreateAsync(request.ToCommand(), cancellationToken);
            return Created($"/api/designs/{design.Id}", design);
        }
        catch (ArgumentException exception)
        {
            return InvalidDesign("Design request is invalid.", exception);
        }
    }

    [HttpGet(Name = "GetDesigns")]
    [ProducesResponseType(typeof(IReadOnlyList<SavedDesign>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<SavedDesign>>> GetDesigns(
        CancellationToken cancellationToken)
    {
        try
        {
            IReadOnlyList<SavedDesign> designs = await useCase.ListAsync(cancellationToken);
            return Ok(designs);
        }
        catch (ArgumentException exception)
        {
            return InvalidDesign("Stored design is invalid.", exception);
        }
    }

    [HttpGet("{id:guid}", Name = "GetDesign")]
    [ProducesResponseType(typeof(SavedDesign), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SavedDesign>> GetDesign(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            SavedDesign? design = await useCase.GetAsync(id, cancellationToken);
            return design is null ? NotFound() : Ok(design);
        }
        catch (ArgumentException exception)
        {
            return InvalidDesign("Stored design is invalid.", exception);
        }
    }

    private ObjectResult InvalidDesign(string title, ArgumentException exception) =>
        Problem(
            title: title,
            detail: exception.Message,
            statusCode: StatusCodes.Status400BadRequest,
            type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
}
