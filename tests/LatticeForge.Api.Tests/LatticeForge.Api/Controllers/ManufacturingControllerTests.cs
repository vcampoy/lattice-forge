using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using LatticeForge.Api.Tests.LatticeForge.Api.Testing;

namespace LatticeForge.Api.Tests.LatticeForge.Api.Controllers;

public sealed class ManufacturingControllerTests : IClassFixture<IsolatedWebApplicationFactory>
{
    private const string BadRequestType = "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request";
    private static readonly string[] AnalysisPropertyNames =
    [
        "solidVolume",
        "optimizedVolume",
        "estimatedWeight",
        "estimatedCost",
        "estimatedPrintMinutes",
        "materialReductionPercent",
        "printabilityScore",
        "supportRisk",
        "warnings",
        "illustrativeEstimate"
    ];
    private static readonly string[] MaterialPropertyNames =
    [
        "id",
        "name",
        "process",
        "density",
        "costPerKg",
        "minimumWallThickness",
        "depositionRate"
    ];
    private readonly HttpClient _client;

    public ManufacturingControllerTests(IsolatedWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMaterials_should_return_canonical_catalogue_when_requested()
    {
        HttpResponseMessage response = await _client.GetAsync("/api/materials");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement[] materials = document.RootElement.EnumerateArray().ToArray();

        Assert.Equal(3, materials.Length);
        AssertMaterial(materials[0], "aluminum-sls", "Aluminium PA", "Sls", 1.04, 68, 1.2, 7.5);
        AssertMaterial(materials[1], "resin-sla", "Clear Resin", "Sla", 1.1, 92, 0.8, 2.2);
        AssertMaterial(materials[2], "titanium-lpbf", "Titanium Ti-6Al-4V", "MetalLpbf", 4.43, 185, 0.6, 1.1);
    }

    [Fact]
    public async Task CreateManufacturingAnalysis_should_return_canonical_wire_contract_when_request_is_valid()
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/analyses", new
        {
            parameters = new { length = 120, height = 80, depth = 40, wallThickness = 4, holeRadius = 8, latticeDensity = 0.5 },
            materialId = "aluminum-sls",
            process = "Sls"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement analysis = document.RootElement;

        AssertPropertyNames(analysis, AnalysisPropertyNames);
        Assert.Equal(76.148, analysis.GetProperty("solidVolume").GetDouble());
        Assert.Equal(39.977, analysis.GetProperty("optimizedVolume").GetDouble());
        Assert.Equal(41.577, analysis.GetProperty("estimatedWeight").GetDouble());
        Assert.Equal(2.83, analysis.GetProperty("estimatedCost").GetDouble());
        Assert.Equal(5.3, analysis.GetProperty("estimatedPrintMinutes").GetDouble());
        Assert.Equal(47.5, analysis.GetProperty("materialReductionPercent").GetDouble());
        Assert.Equal(94, analysis.GetProperty("printabilityScore").GetInt32());
        Assert.Equal("Low", analysis.GetProperty("supportRisk").GetString());
        Assert.Empty(analysis.GetProperty("warnings").EnumerateArray());
        Assert.True(analysis.GetProperty("illustrativeEstimate").GetBoolean());
    }

    [Fact]
    public async Task CreateManufacturingAnalysis_should_return_problem_details_when_dimensions_are_invalid()
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/analyses", new
        {
            parameters = new { length = 0, height = 80, depth = 40, wallThickness = 4, holeRadius = 8, latticeDensity = 0.5 },
            materialId = "aluminum-sls",
            process = "Sls"
        });

        await AssertProblemDetailsAsync(
            response,
            "Manufacturing analysis request is invalid.",
            "Length must be greater than 0 and no more than 1000 mm. (Parameter 'Length')");
    }

    [Fact]
    public async Task CreateManufacturingAnalysis_should_return_validation_problem_when_body_is_missing()
    {
        using StringContent content = new(string.Empty, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await _client.PostAsync("/api/analyses", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement problem = document.RootElement;
        Assert.Equal("One or more validation errors occurred.", problem.GetProperty("title").GetString());
        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("traceId").GetString()));
    }

    private static void AssertMaterial(
        JsonElement material,
        string id,
        string name,
        string process,
        double density,
        double costPerKg,
        double minimumWallThickness,
        double depositionRate)
    {
        AssertPropertyNames(material, MaterialPropertyNames);
        Assert.Equal(id, material.GetProperty("id").GetString());
        Assert.Equal(name, material.GetProperty("name").GetString());
        Assert.Equal(process, material.GetProperty("process").GetString());
        Assert.Equal(density, material.GetProperty("density").GetDouble());
        Assert.Equal(costPerKg, material.GetProperty("costPerKg").GetDouble());
        Assert.Equal(minimumWallThickness, material.GetProperty("minimumWallThickness").GetDouble());
        Assert.Equal(depositionRate, material.GetProperty("depositionRate").GetDouble());
    }

    private static async Task AssertProblemDetailsAsync(
        HttpResponseMessage response,
        string expectedTitle,
        string expectedDetail)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement problem = document.RootElement;
        AssertPropertyNames(problem, TestContractConstants.ProblemDetailsPropertyNames);
        Assert.Equal(BadRequestType, problem.GetProperty("type").GetString());
        Assert.Equal(expectedTitle, problem.GetProperty("title").GetString());
        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.Equal(expectedDetail, problem.GetProperty("detail").GetString());
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("traceId").GetString()));
    }

    private static void AssertPropertyNames(JsonElement element, string[] expectedNames) =>
        Assert.Equal(expectedNames, element.EnumerateObject().Select(property => property.Name));
}
