using LatticeForge.UseCase.Health.GetHealth;
using LatticeForge.UseCase.Health.GetHealth.Dtos;
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
