using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using LatticeForge.Api.Designs;
using LatticeForge.Api.Tests.LatticeForge.Api.Testing;
using LatticeForge.Domain.Manufacturing;
using LatticeForge.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace LatticeForge.Api.Tests.LatticeForge.Api.Controllers;

public sealed class DesignControllerTests
{
    private const string BadRequestType = "https://www.rfc-editor.org/rfc/rfc9110#name-400-bad-request";
    private static readonly string[] ParametersPropertyNames =
    [
        "length",
        "height",
        "depth",
        "wallThickness",
        "holeRadius",
        "latticeDensity"
    ];
    private static readonly string[] SavedDesignPropertyNames =
    [
        "id",
        "name",
        "createdAt",
        "updatedAt",
        "parameters",
        "materialId",
        "process",
        "schemaVersion"
    ];
    private static readonly DesignRequest ValidRequest = new(
        "Bracket baseline",
        new BracketParameters(120, 80, 40, 4, 8, 0.5),
        "aluminum-sls",
        ManufacturingProcess.Sls,
        1);

    [Fact]
    public async Task CreateDesign_should_persist_design_and_return_created_when_request_is_valid()
    {
        using IsolatedWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/designs", ValidRequest);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Guid designId = AssertSavedDesign(document.RootElement, ValidRequest.Name);
        Assert.Equal($"/api/designs/{designId}", response.Headers.Location?.OriginalString);
    }

    [Fact]
    public async Task GetDesign_should_restore_same_parameters_when_api_restarts()
    {
        string databasePath = CreateDatabasePath();

        try
        {
            Guid designId;
            using (IsolatedWebApplicationFactory firstFactory = new(databasePath))
            {
                using HttpClient firstClient = firstFactory.CreateClient();
                HttpResponseMessage postResponse = await firstClient.PostAsJsonAsync("/api/designs", ValidRequest);
                using JsonDocument postDocument = JsonDocument.Parse(await postResponse.Content.ReadAsStringAsync());
                designId = AssertSavedDesign(postDocument.RootElement, ValidRequest.Name);
            }

            using (IsolatedWebApplicationFactory secondFactory = new(databasePath))
            {
                using HttpClient secondClient = secondFactory.CreateClient();
                HttpResponseMessage response = await secondClient.GetAsync($"/api/designs/{designId}");

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
                using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                Assert.Equal(designId, AssertSavedDesign(document.RootElement, ValidRequest.Name));
            }
        }
        finally
        {
            DeleteDatabaseFiles(databasePath);
        }
    }

    [Fact]
    public async Task GetDesign_should_return_not_found_when_identifier_is_not_guid()
    {
        using IsolatedWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.GetAsync("/api/designs/not-a-guid");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateDesign_should_reject_invalid_parameters_when_analysis_validation_fails()
    {
        using IsolatedWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();
        DesignRequest invalidRequest = ValidRequest with
        {
            Parameters = ValidRequest.Parameters with { WallThickness = 21 }
        };

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/designs", invalidRequest);

        await AssertProblemDetailsAsync(
            response,
            "Design request is invalid.",
            "Wall thickness must be positive and fit within the bracket dimensions. (Parameter 'parameters')");
    }

    [Fact]
    public async Task CreateDesign_should_reject_blank_name_when_request_is_invalid()
    {
        using IsolatedWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync(
            "/api/designs",
            ValidRequest with { Name = "   " });

        await AssertProblemDetailsAsync(
            response,
            "Design request is invalid.",
            "Design name must contain between 1 and 80 characters. (Parameter 'command')");
    }

    [Fact]
    public async Task GetDesign_should_reject_corrupted_parameters_when_persisted_value_is_invalid()
    {
        string databasePath = CreateDatabasePath();

        try
        {
            using IsolatedWebApplicationFactory factory = new(databasePath);
            using HttpClient client = factory.CreateClient();
            HttpResponseMessage postResponse = await client.PostAsJsonAsync("/api/designs", ValidRequest);
            using JsonDocument postDocument = JsonDocument.Parse(await postResponse.Content.ReadAsStringAsync());
            Guid designId = AssertSavedDesign(postDocument.RootElement, ValidRequest.Name);
            DbContextOptions<DesignDbContext> options = new DbContextOptionsBuilder<DesignDbContext>()
                .UseSqlite($"Data Source={databasePath}")
                .Options;
            await using (DesignDbContext context = new(options))
            {
                DesignEntity entity = await context.Designs.SingleAsync(design => design.Id == designId);
                entity.LatticeDensity = 2;
                await context.SaveChangesAsync();
            }

            HttpResponseMessage response = await client.GetAsync($"/api/designs/{designId}");

            await AssertProblemDetailsAsync(
                response,
                "Stored design is invalid.",
                "Lattice density must be between 0 and 1. (Parameter 'parameters')");
        }
        finally
        {
            DeleteDatabaseFiles(databasePath);
        }
    }

    [Fact]
    public async Task GetDesigns_should_return_saved_designs_ordered_by_updated_timestamp()
    {
        using IsolatedWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/designs", ValidRequest with { Name = "First" });
        await client.PostAsJsonAsync("/api/designs", ValidRequest with { Name = "Second" });

        HttpResponseMessage response = await client.GetAsync("/api/designs");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using JsonDocument document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        JsonElement[] designs = document.RootElement.EnumerateArray().ToArray();
        Assert.Equal(2, designs.Length);
        AssertSavedDesign(designs[0], "Second");
        AssertSavedDesign(designs[1], "First");
    }

    private static Guid AssertSavedDesign(JsonElement design, string expectedName)
    {
        AssertPropertyNames(design, SavedDesignPropertyNames);
        Guid designId = design.GetProperty("id").GetGuid();
        Assert.NotEqual(Guid.Empty, designId);
        Assert.Equal(expectedName, design.GetProperty("name").GetString());
        Assert.True(design.GetProperty("createdAt").TryGetDateTimeOffset(out _));
        Assert.True(design.GetProperty("updatedAt").TryGetDateTimeOffset(out _));
        AssertParameters(design.GetProperty("parameters"));
        Assert.Equal("aluminum-sls", design.GetProperty("materialId").GetString());
        Assert.Equal("Sls", design.GetProperty("process").GetString());
        Assert.Equal(1, design.GetProperty("schemaVersion").GetInt32());
        return designId;
    }

    private static void AssertParameters(JsonElement parameters)
    {
        AssertPropertyNames(parameters, ParametersPropertyNames);
        Assert.Equal(120, parameters.GetProperty("length").GetDouble());
        Assert.Equal(80, parameters.GetProperty("height").GetDouble());
        Assert.Equal(40, parameters.GetProperty("depth").GetDouble());
        Assert.Equal(4, parameters.GetProperty("wallThickness").GetDouble());
        Assert.Equal(8, parameters.GetProperty("holeRadius").GetDouble());
        Assert.Equal(0.5, parameters.GetProperty("latticeDensity").GetDouble());
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

    private static void DeleteDatabaseFiles(string databasePath)
    {
        SqliteConnection.ClearAllPools();
        foreach (string suffix in TestContractConstants.DatabaseFileSuffixes)
        {
            File.Delete(databasePath + suffix);
        }
    }

    private static IsolatedWebApplicationFactory CreateFactory() => new();

    private static string CreateDatabasePath() =>
        Path.Combine(Path.GetTempPath(), $"lattice-forge-{Guid.NewGuid():N}.db");
}
