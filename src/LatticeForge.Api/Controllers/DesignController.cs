using LatticeForge.UseCase.Designs.CreateDesign;
using LatticeForge.UseCase.Designs.CreateDesign.Dtos;
using LatticeForge.UseCase.Designs.GetDesign;
using LatticeForge.UseCase.Designs.GetDesign.Dtos;
using LatticeForge.UseCase.Designs.GetDesigns;
using LatticeForge.UseCase.Designs.GetDesigns.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace LatticeForge.Api.Controllers;

[ApiController]
[Route("api/designs")]
public sealed class DesignController(
    ICreateDesignUseCase createDesign,
    IGetDesignsUseCase getDesigns,
    IGetDesignUseCase getDesign) : ControllerBase
{
    [HttpPost(Name = "CreateDesign")]
    [ProducesResponseType(typeof(CreateDesignResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateDesignResponse>> CreateDesign(
        [FromBody] CreateDesignRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            CreateDesignResponse response = await createDesign.ExecuteAsync(request, cancellationToken);
            return Created($"/api/designs/{response.Id}", response);
        }
        catch (ArgumentException exception)
        {
            return InvalidDesign("Design request is invalid.", exception);
        }
    }

    [HttpGet(Name = "GetDesigns")]
    [ProducesResponseType(typeof(IReadOnlyList<GetDesignsResponse.DesignDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<GetDesignsResponse.DesignDto>>> GetDesigns(
        CancellationToken cancellationToken)
    {
        try
        {
            GetDesignsResponse response = await getDesigns.ExecuteAsync(
                new GetDesignsRequest(),
                cancellationToken);
            return Ok(response.Designs);
        }
        catch (ArgumentException exception)
        {
            return InvalidDesign("Stored design is invalid.", exception);
        }
    }

    [HttpGet("{id:guid}", Name = "GetDesign")]
    [ProducesResponseType(typeof(GetDesignResponse.DesignDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GetDesignResponse.DesignDto>> GetDesign(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            GetDesignResponse? response = await getDesign.ExecuteAsync(
                new GetDesignRequest(id),
                cancellationToken);
            return response is null ? NotFound() : Ok(response.Design);
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
