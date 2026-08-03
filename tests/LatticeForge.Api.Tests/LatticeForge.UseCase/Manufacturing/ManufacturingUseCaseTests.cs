using LatticeForge.Domain.Manufacturing;
using LatticeForge.UseCase.Manufacturing;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Manufacturing;

public sealed class ManufacturingUseCaseTests
{
    private static readonly BracketParameters ValidParameters = new(120, 80, 40, 4, 8, 0.5);
    private static readonly MaterialProfile[] ExpectedCatalogue =
    [
        new("aluminum-sls", "Aluminium PA", ManufacturingProcess.Sls, 1.04, 68, 1.2, 7.5),
        new("resin-sla", "Clear Resin", ManufacturingProcess.Sla, 1.1, 92, 0.8, 2.2),
        new("titanium-lpbf", "Titanium Ti-6Al-4V", ManufacturingProcess.MetalLpbf, 4.43, 185, 0.6, 1.1)
    ];

    [Fact]
    public void Analyze_should_return_canonical_result_when_parameters_are_valid()
    {
        ManufacturingUseCase useCase = new();

        ManufacturingAnalysis result = useCase.Analyze(
            ValidParameters,
            "aluminum-sls",
            ManufacturingProcess.Sls);

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
    public void Materials_should_return_canonical_catalogue_when_requested()
    {
        ManufacturingUseCase useCase = new();

        Assert.Equal(ExpectedCatalogue, useCase.Materials);
    }

    [Fact]
    public void Analyze_should_reject_invalid_dimensions_when_a_dimension_is_non_positive()
    {
        ManufacturingUseCase useCase = new();

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.Analyze(ValidParameters with { Length = 0 }, "aluminum-sls", ManufacturingProcess.Sls));

        Assert.Contains("Length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Analyze_should_reject_non_finite_parameters_when_a_dimension_is_not_finite()
    {
        ManufacturingUseCase useCase = new();

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.Analyze(ValidParameters with { Length = double.NaN }, "aluminum-sls", ManufacturingProcess.Sls));

        Assert.Contains("Length", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Analyze_should_reject_wall_thickness_outside_safe_bounds_when_wall_exceeds_half_depth()
    {
        ManufacturingUseCase useCase = new();

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.Analyze(ValidParameters with { WallThickness = 21 }, "aluminum-sls", ManufacturingProcess.Sls));

        Assert.Contains("Wall thickness", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Validate_should_reject_incompatible_process_when_material_does_not_match()
    {
        ManufacturingUseCase useCase = new();

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.Validate(ValidParameters, "resin-sla", ManufacturingProcess.Sls));

        Assert.Contains("process", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Analyze_should_add_minimum_wall_warning_when_wall_is_below_material_limit()
    {
        ManufacturingUseCase useCase = new();

        ManufacturingAnalysis result = useCase.Analyze(
            ValidParameters with { WallThickness = 1 },
            "aluminum-sls",
            ManufacturingProcess.Sls);

        Assert.Equal(
            ["Wall thickness is below the 1.2 mm minimum for Aluminium PA."],
            result.Warnings);
    }

    [Fact]
    public void Analyze_should_increase_optimized_volume_when_lattice_density_increases()
    {
        ManufacturingUseCase useCase = new();

        ManufacturingAnalysis low = useCase.Analyze(
            ValidParameters with { LatticeDensity = 0.2 },
            "aluminum-sls",
            ManufacturingProcess.Sls);
        ManufacturingAnalysis high = useCase.Analyze(
            ValidParameters with { LatticeDensity = 0.8 },
            "aluminum-sls",
            ManufacturingProcess.Sls);

        Assert.True(high.OptimizedVolume > low.OptimizedVolume);
    }

    [Fact]
    public void Analyze_should_increase_weight_when_wall_thickness_increases()
    {
        ManufacturingUseCase useCase = new();

        ManufacturingAnalysis thin = useCase.Analyze(
            ValidParameters with { WallThickness = 2 },
            "aluminum-sls",
            ManufacturingProcess.Sls);
        ManufacturingAnalysis thick = useCase.Analyze(
            ValidParameters with { WallThickness = 8 },
            "aluminum-sls",
            ManufacturingProcess.Sls);

        Assert.True(thick.EstimatedWeight > thin.EstimatedWeight);
    }

    [Fact]
    public void Analyze_should_clamp_printability_score_when_inputs_are_extreme()
    {
        ManufacturingUseCase useCase = new();

        ManufacturingAnalysis result = useCase.Analyze(
            ValidParameters with { WallThickness = 1, LatticeDensity = 1 },
            "aluminum-sls",
            ManufacturingProcess.Sls);

        Assert.InRange(result.PrintabilityScore, 0, 100);
    }
}
