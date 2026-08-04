using LatticeForge.Domain.Dtos.Manufacturing;
using LatticeForge.UseCase.Manufacturing.AnalyzeMaterials;
using LatticeForge.UseCase.Manufacturing.AnalyzeMaterials.Dtos;
using LatticeForge.UseCase.Manufacturing.GetMaterials;
using LatticeForge.UseCase.Manufacturing.GetMaterials.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace LatticeForge.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class ManufacturingController(
    IGetMaterialsUseCase getMaterials,
    IAnalyzeMaterialsUseCase analyzeMaterials) : ControllerBase
{
    [HttpGet("materials", Name = "GetMaterials")]
    [ProducesResponseType(typeof(IReadOnlyList<GetMaterialsResponse.MaterialDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<GetMaterialsResponse.MaterialDto>> GetMaterials() =>
        Ok(getMaterials.Execute(new GetMaterialsRequest()).Materials);

    [HttpPost("analyses", Name = "CreateManufacturingAnalysis")]
    [ProducesResponseType(typeof(AnalyzeMaterialsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<AnalyzeMaterialsResponse> CreateManufacturingAnalysis(
        [FromBody] AnalyzeMaterialsRequest request)
    {
        try
        {
            AnalyzeMaterialsResponse response = analyzeMaterials.Execute(request);
            return Ok(response);
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
