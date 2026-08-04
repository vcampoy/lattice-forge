using Microsoft.AspNetCore.Mvc;

namespace LatticeForge.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet(Name = "GetHealth")]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> GetHealth() =>
        Ok(new HealthResponse("ok", "Lattice Forge API"));
}
