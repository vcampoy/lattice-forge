using System.Net;
using System.Net.Http.Json;
using LatticeForge.Api.Tests.LatticeForge.Api.Testing;
using LatticeForge.UseCase.Health.GetHealth.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.Api.Controllers;

public sealed class HealthControllerTests : IClassFixture<IsolatedWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthControllerTests(IsolatedWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_should_return_ok_status_when_api_is_running()
    {
        HttpResponseMessage response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        GetHealthResponse? payload = await response.Content.ReadFromJsonAsync<GetHealthResponse>();
        Assert.NotNull(payload);
        Assert.Equal("ok", payload.Status);
        Assert.Equal("Lattice Forge API", payload.Service);
    }
}
