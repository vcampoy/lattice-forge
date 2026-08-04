using LatticeForge.UseCase.Health.GetHealthUseCase;
using LatticeForge.UseCase.Health.GetHealthUseCase.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace LatticeForge.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController(IGetHealthUseCase getHealth) : ControllerBase
{
    [HttpGet(Name = "GetHealth")]
    [ProducesResponseType(typeof(GetHealthResponse), StatusCodes.Status200OK)]
    public ActionResult<GetHealthResponse> GetHealth() =>
        Ok(getHealth.Execute(new GetHealthRequest()));
}
