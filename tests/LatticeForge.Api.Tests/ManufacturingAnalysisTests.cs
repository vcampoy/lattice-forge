using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using LatticeForge.Api.Manufacturing;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LatticeForge.Api.Tests;

public sealed class ManufacturingAnalysisTests
{
    private static readonly BracketParameters ValidParameters = new(120, 80, 40, 4, 8, 0.5);

    [Fact]
    public void Analyze_should_return_deterministic_illustrative_result_when_parameters_are_valid()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ManufacturingAnalysis first = service.Analyze(ValidParameters, "aluminum-sls", ManufacturingProcess.Sls);
        ManufacturingAnalysis second = service.Analyze(ValidParameters, "aluminum-sls", ManufacturingProcess.Sls);

        Assert.Equal(first.SolidVolume, second.SolidVolume);
        Assert.Equal(first.OptimizedVolume, second.OptimizedVolume);
        Assert.Equal(first.EstimatedWeight, second.EstimatedWeight);
        Assert.Equal(first.EstimatedCost, second.EstimatedCost);
        Assert.Equal(first.EstimatedPrintMinutes, second.EstimatedPrintMinutes);
        Assert.Equal(first.MaterialReductionPercent, second.MaterialReductionPercent);
        Assert.Equal(first.PrintabilityScore, second.PrintabilityScore);
        Assert.Equal(first.SupportRisk, second.SupportRisk);
        Assert.Equal(first.Warnings, second.Warnings);
        Assert.Equal(first.IllustrativeEstimate, second.IllustrativeEstimate);
        Assert.True(first.SolidVolume > first.OptimizedVolume);
        Assert.True(first.EstimatedWeight > 0);
        Assert.True(first.EstimatedCost > 0);
        Assert.True(first.EstimatedPrintMinutes > 0);
        Assert.True(first.IllustrativeEstimate);
    }

    [Fact]
    public void Analyze_should_reject_invalid_dimensions_when_a_dimension_is_non_positive()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            service.Analyze(ValidParameters with { Length = 0 }, "aluminum-sls", ManufacturingProcess.Sls));

        Assert.Contains("Length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Analyze_should_reject_non_finite_parameters_when_a_dimension_is_not_finite()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            service.Analyze(ValidParameters with { Length = double.NaN }, "aluminum-sls", ManufacturingProcess.Sls));

        Assert.Contains("Length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Analyze_should_reject_wall_thickness_outside_safe_bounds_when_wall_exceeds_half_depth()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            service.Analyze(ValidParameters with { WallThickness = 21 }, "aluminum-sls", ManufacturingProcess.Sls));

        Assert.Contains("Wall thickness", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Analyze_should_reject_incompatible_material_process_when_process_does_not_match()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            service.Analyze(ValidParameters, "resin-sla", ManufacturingProcess.Sls));

        Assert.Contains("process", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Analyze_should_add_minimum_wall_warning_when_wall_is_below_material_limit()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ManufacturingAnalysis result = service.Analyze(ValidParameters with { WallThickness = 1 }, "aluminum-sls", ManufacturingProcess.Sls);

        Assert.Contains(result.Warnings, warning => warning.Contains("wall", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Analyze_should_increase_optimized_volume_when_lattice_density_increases()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ManufacturingAnalysis low = service.Analyze(ValidParameters with { LatticeDensity = 0.2 }, "aluminum-sls", ManufacturingProcess.Sls);
        ManufacturingAnalysis high = service.Analyze(ValidParameters with { LatticeDensity = 0.8 }, "aluminum-sls", ManufacturingProcess.Sls);

        Assert.True(high.OptimizedVolume > low.OptimizedVolume);
    }

    [Fact]
    public void Analyze_should_increase_weight_when_wall_thickness_increases()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ManufacturingAnalysis thin = service.Analyze(ValidParameters with { WallThickness = 2 }, "aluminum-sls", ManufacturingProcess.Sls);
        ManufacturingAnalysis thick = service.Analyze(ValidParameters with { WallThickness = 8 }, "aluminum-sls", ManufacturingProcess.Sls);

        Assert.True(thick.EstimatedWeight > thin.EstimatedWeight);
    }

    [Fact]
    public void Analyze_should_clamp_printability_score_between_zero_and_one_hundred_for_extreme_inputs()
    {
        ManufacturingAnalysisService service = new(MaterialCatalogue.All);

        ManufacturingAnalysis result = service.Analyze(ValidParameters with { WallThickness = 1, LatticeDensity = 1 }, "aluminum-sls", ManufacturingProcess.Sls);

        Assert.InRange(result.PrintabilityScore, 0, 100);
    }
}

public sealed class ManufacturingEndpointsTests : IClassFixture<IsolatedWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ManufacturingEndpointsTests(IsolatedWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMaterials_should_return_catalogue_with_one_material_per_process()
    {
        HttpResponseMessage response = await _client.GetAsync("/api/materials");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        List<MaterialProfile>? materials = await response.Content.ReadFromJsonAsync<List<MaterialProfile>>(new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        });
        Assert.NotNull(materials);
        Assert.True(materials.Exists(material => material.Process == ManufacturingProcess.Sls));
        Assert.True(materials.Exists(material => material.Process == ManufacturingProcess.Sla));
        Assert.True(materials.Exists(material => material.Process == ManufacturingProcess.MetalLpbf));
    }

    [Fact]
    public async Task PostAnalysis_should_return_analysis_when_request_is_valid()
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/analyses", new
        {
            parameters = new { length = 120, height = 80, depth = 40, wallThickness = 4, holeRadius = 8, latticeDensity = 0.5 },
            materialId = "aluminum-sls",
            process = "SLS"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        ManufacturingAnalysis? analysis = await response.Content.ReadFromJsonAsync<ManufacturingAnalysis>();
        Assert.NotNull(analysis);
        Assert.True(analysis!.IllustrativeEstimate);
    }

    [Fact]
    public async Task PostAnalysis_should_return_problem_details_when_dimensions_are_invalid()
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/analyses", new
        {
            parameters = new { length = 0, height = 80, depth = 40, wallThickness = 4, holeRadius = 8, latticeDensity = 0.5 },
            materialId = "aluminum-sls",
            process = "SLS"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
