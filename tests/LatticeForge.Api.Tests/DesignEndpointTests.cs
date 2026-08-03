using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using LatticeForge.Api.Manufacturing;
using LatticeForge.Api.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LatticeForge.Api.Tests;

public sealed class DesignEndpointTests
{
    private static readonly DesignRequest ValidRequest = new(
        "Bracket baseline",
        new BracketParameters(120, 80, 40, 4, 8, 0.5),
        "aluminum-sls",
        ManufacturingProcess.Sls,
        1);
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    [Fact]
    public async Task PostDesign_should_persist_design_and_return_created_when_request_is_valid()
    {
        using DesignWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/designs", ValidRequest);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        SavedDesign? design = await response.Content.ReadFromJsonAsync<SavedDesign>(JsonOptions);
        Assert.NotNull(design);
        Assert.NotEqual(Guid.Empty, design!.Id);
        Assert.Equal(ValidRequest.Name, design.Name);
        Assert.Equal(ValidRequest.Parameters, design.Parameters);
        Assert.Equal(ValidRequest.MaterialId, design.MaterialId);
        Assert.Equal(ValidRequest.Process, design.Process);
        Assert.Equal(1, design.SchemaVersion);
    }

    [Fact]
    public async Task GetDesign_should_restore_same_parameters_after_api_restart()
    {
        string databasePath = Path.Combine(Path.GetTempPath(), $"lattice-forge-{Guid.NewGuid():N}.db");
        Guid designId;

        using (DesignWebApplicationFactory firstFactory = new(databasePath))
        {
            using HttpClient firstClient = firstFactory.CreateClient();
            HttpResponseMessage postResponse = await firstClient.PostAsJsonAsync("/api/designs", ValidRequest);
            SavedDesign saved = (await postResponse.Content.ReadFromJsonAsync<SavedDesign>(JsonOptions))!;
            designId = saved.Id;
        }

        using (DesignWebApplicationFactory secondFactory = new(databasePath))
        {
            using HttpClient secondClient = secondFactory.CreateClient();
            SavedDesign? restored = await secondClient.GetFromJsonAsync<SavedDesign>($"/api/designs/{designId}", JsonOptions);

            Assert.NotNull(restored);
            Assert.Equal(designId, restored!.Id);
            Assert.Equal(ValidRequest.Parameters, restored.Parameters);
            Assert.Equal(ValidRequest.MaterialId, restored.MaterialId);
            Assert.Equal(ValidRequest.Process, restored.Process);
        }

    }

    [Fact]
    public async Task PostDesign_should_reject_invalid_parameters_using_analysis_validation()
    {
        using DesignWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        DesignRequest invalidRequest = ValidRequest with
        {
            Parameters = ValidRequest.Parameters with { WallThickness = 21 }
        };

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/designs", invalidRequest);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task PostDesign_should_reject_blank_name_when_request_is_invalid()
    {
        using DesignWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/designs", ValidRequest with { Name = "   " });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetDesign_should_reject_invalid_persisted_parameters_safely_when_database_value_is_corrupted()
    {
        string databasePath = Path.Combine(Path.GetTempPath(), $"lattice-forge-{Guid.NewGuid():N}.db");
        using DesignWebApplicationFactory factory = new(databasePath);
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage postResponse = await client.PostAsJsonAsync("/api/designs", ValidRequest);
        SavedDesign saved = (await postResponse.Content.ReadFromJsonAsync<SavedDesign>(JsonOptions))!;

        DbContextOptions<DesignDbContext> options = new DbContextOptionsBuilder<DesignDbContext>()
            .UseSqlite($"Data Source={databasePath}")
            .Options;
        await using (DesignDbContext context = new(options))
        {
            DesignEntity entity = (await context.Designs.SingleAsync(design => design.Id == saved.Id));
            entity.LatticeDensity = 2;
            await context.SaveChangesAsync();
        }

        HttpResponseMessage response = await client.GetAsync($"/api/designs/{saved.Id}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetDesigns_should_return_saved_designs_ordered_by_updated_timestamp()
    {
        using DesignWebApplicationFactory factory = CreateFactory();
        using HttpClient client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/designs", ValidRequest with { Name = "First" });
        await client.PostAsJsonAsync("/api/designs", ValidRequest with { Name = "Second" });

        List<SavedDesign>? designs = await client.GetFromJsonAsync<List<SavedDesign>>("/api/designs", JsonOptions);

        Assert.NotNull(designs);
        Assert.Equal(2, designs!.Count);
        Assert.Equal("Second", designs[0].Name);
    }

    private static DesignWebApplicationFactory CreateFactory()
    {
        return new DesignWebApplicationFactory(Path.Combine(Path.GetTempPath(), $"lattice-forge-{Guid.NewGuid():N}.db"));
    }

    private sealed record DesignRequest(
        string Name,
        BracketParameters Parameters,
        string MaterialId,
        ManufacturingProcess Process,
        int SchemaVersion);

    private sealed record SavedDesign(
        Guid Id,
        string Name,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        BracketParameters Parameters,
        string MaterialId,
        ManufacturingProcess Process,
        int SchemaVersion);

    private sealed class DesignWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _databasePath;

        public DesignWebApplicationFactory(string databasePath)
        {
            _databasePath = databasePath;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseSetting("ConnectionStrings:Designs", $"Data Source={_databasePath}")
                .ConfigureLogging(logging => logging.ClearProviders());
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (disposing)
            {
                try
                {
                    File.Delete(_databasePath);
                }
                catch (IOException)
                {
                    // SQLite may release its native handle after disposal; the unique temp file is safe to leave.
                }
            }
        }

    }
}
