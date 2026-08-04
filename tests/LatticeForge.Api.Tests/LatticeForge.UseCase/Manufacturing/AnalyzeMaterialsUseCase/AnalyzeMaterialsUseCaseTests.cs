using LatticeForge.Domain.Manufacturing;
using LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase;
using LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Manufacturing;

public sealed class AnalyzeMaterialsUseCaseTests
{
    private static readonly BracketParameters ValidParameters = new(120, 80, 40, 4, 8, 0.5);
    private static readonly AnalyzeMaterialsUseCaseImpl UseCase = new();

    [Fact]
    public void Execute_should_return_canonical_result_when_request_is_valid()
    {
        AnalyzeMaterialsResponse result = UseCase.Execute(CreateRequest());

        Assert.Equal(76.148, result.SolidVolume);
        Assert.Equal(39.977, result.OptimizedVolume);
        Assert.Equal(41.577, result.EstimatedWeight);
        Assert.Equal(2.83, result.EstimatedCost);
        Assert.Equal(5.3, result.EstimatedPrintMinutes);
        Assert.Equal(47.5, result.MaterialReductionPercent);
        Assert.Equal(94, result.PrintabilityScore);
        Assert.Equal("Low", result.SupportRisk);
        Assert.Empty(result.Warnings);
        Assert.True(result.IllustrativeEstimate);
    }

    [Fact]
    public void Execute_should_reject_invalid_dimensions_when_a_dimension_is_non_positive()
    {
        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            UseCase.Execute(CreateRequest(ValidParameters with { Length = 0 })));

        Assert.Contains("Length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Execute_should_reject_non_finite_parameters_when_a_dimension_is_not_finite()
    {
        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            UseCase.Execute(CreateRequest(ValidParameters with { Length = double.NaN })));

        Assert.Contains("Length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Execute_should_reject_wall_thickness_outside_safe_bounds_when_wall_exceeds_half_depth()
    {
        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            UseCase.Execute(CreateRequest(ValidParameters with { WallThickness = 21 })));

        Assert.Contains("Wall thickness", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Execute_should_reject_incompatible_process_when_material_does_not_match()
    {
        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            UseCase.Execute(CreateRequest(materialId: "resin-sla", process: ManufacturingProcess.Sls)));

        Assert.Contains("process", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Execute_should_add_minimum_wall_warning_when_wall_is_below_material_limit()
    {
        AnalyzeMaterialsResponse result = UseCase.Execute(CreateRequest(ValidParameters with { WallThickness = 1 }));

        Assert.Equal(
            ["Wall thickness is below the 1.2 mm minimum for Aluminium PA."],
            result.Warnings);
    }

    [Fact]
    public void Execute_should_increase_optimized_volume_when_lattice_density_increases()
    {
        AnalyzeMaterialsResponse low = UseCase.Execute(CreateRequest(ValidParameters with { LatticeDensity = 0.2 }));
        AnalyzeMaterialsResponse high = UseCase.Execute(CreateRequest(ValidParameters with { LatticeDensity = 0.8 }));

        Assert.True(high.OptimizedVolume > low.OptimizedVolume);
    }

    [Fact]
    public void Execute_should_increase_weight_when_wall_thickness_increases()
    {
        AnalyzeMaterialsResponse thin = UseCase.Execute(CreateRequest(ValidParameters with { WallThickness = 2 }));
        AnalyzeMaterialsResponse thick = UseCase.Execute(CreateRequest(ValidParameters with { WallThickness = 8 }));

        Assert.True(thick.EstimatedWeight > thin.EstimatedWeight);
    }

    [Fact]
    public void Execute_should_clamp_printability_score_when_inputs_are_extreme()
    {
        AnalyzeMaterialsResponse result = UseCase.Execute(CreateRequest(
            ValidParameters with { WallThickness = 1, LatticeDensity = 1 }));

        Assert.InRange(result.PrintabilityScore, 0, 100);
    }

    private static AnalyzeMaterialsRequest CreateRequest(
        BracketParameters? parameters = null,
        string materialId = "aluminum-sls",
        ManufacturingProcess process = ManufacturingProcess.Sls) =>
        new(parameters ?? ValidParameters, materialId, process);
}
