using LatticeForge.Api.Manufacturing;
using LatticeForge.Domain.Manufacturing;
using LatticeForge.UseCase.Manufacturing;
using Microsoft.AspNetCore.Mvc;

namespace LatticeForge.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class ManufacturingController(
    IManufacturingUseCase useCase) : ControllerBase
{
    [HttpGet("materials", Name = "GetMaterials")]
    [ProducesResponseType(typeof(IReadOnlyList<MaterialProfile>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<MaterialProfile>> GetMaterials() =>
        Ok(useCase.Materials);

    [HttpPost("analyses", Name = "CreateManufacturingAnalysis")]
    [ProducesResponseType(typeof(ManufacturingAnalysis), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<ManufacturingAnalysis> CreateManufacturingAnalysis(
        [FromBody] AnalysisRequest request)
    {
        try
        {
            ManufacturingAnalysis analysis = useCase.Analyze(
                request.Parameters,
                request.MaterialId,
                request.Process);
            return Ok(analysis);
        }
        catch (ArgumentException exception)
        {
            return InvalidAnalysis(exception);
        }
    }

    private ObjectResult InvalidAnalysis(ArgumentException exception) =>
        Problem(
            title: "Manufacturing analysis request is invalid.",
            detail: exception.Message,
            statusCode: StatusCodes.Status400BadRequest,
            type: "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request");
}
