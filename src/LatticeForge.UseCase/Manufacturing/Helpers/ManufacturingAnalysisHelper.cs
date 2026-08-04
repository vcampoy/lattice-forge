using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing.Helpers;

public static class ManufacturingAnalysisHelper
{
    private const double MillimetresPerCubicCentimetre = 1000;

    public static ManufacturingAnalysis Analyze(
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process)
    {
        ManufacturingValidationHelper.Validate(parameters, materialId, process);
        MaterialCatalogueHelper.TryGetMaterial(materialId, out MaterialProfile? material);
        ArgumentNullException.ThrowIfNull(material);

        double wallFactor = 0.22 + Math.Clamp(parameters.WallThickness / 20, 0, 1) * 0.08;
        double envelopeVolumeCubicMillimetres = parameters.Length * parameters.Height * parameters.Depth * wallFactor;
        double holeVolumeCubicMillimetres = Math.PI * Math.Pow(parameters.HoleRadius, 2) * parameters.Depth * 2 * 0.9;
        double solidVolume = Math.Max(
            0.001,
            (envelopeVolumeCubicMillimetres - holeVolumeCubicMillimetres) / MillimetresPerCubicCentimetre);
        double optimizedVolume = solidVolume * (0.30 + parameters.LatticeDensity * 0.45);
        double estimatedWeight = optimizedVolume * material.Density;
        double estimatedCost = estimatedWeight / 1000 * material.CostPerKg;
        double estimatedPrintMinutes = Math.Max(1, optimizedVolume / material.DepositionRate);
        double materialReductionPercent = Math.Clamp((1 - optimizedVolume / solidVolume) * 100, 0, 100);

        List<string> warnings = [];
        if (parameters.WallThickness < material.MinimumWallThickness)
        {
            warnings.Add($"Wall thickness is below the {material.MinimumWallThickness:0.##} mm minimum for {material.Name}.");
        }

        double wallScore = Math.Clamp(parameters.WallThickness / material.MinimumWallThickness, 0, 1);
        double densityScore = 1 - Math.Abs(parameters.LatticeDensity - 0.5) * 0.8;
        double geometryScore = Math.Clamp(parameters.HoleRadius / Math.Min(parameters.Length, parameters.Height) * 4, 0, 1);
        int printabilityScore = (int)Math.Round(Math.Clamp(35 + wallScore * 35 + densityScore * 20 + geometryScore * 10, 0, 100));
        string supportRisk = printabilityScore switch
        {
            >= 80 => "Low",
            >= 55 => "Medium",
            _ => "High"
        };

        return new ManufacturingAnalysis(
            Math.Round(solidVolume, 3),
            Math.Round(optimizedVolume, 3),
            Math.Round(estimatedWeight, 3),
            Math.Round(estimatedCost, 2),
            Math.Round(estimatedPrintMinutes, 1),
            Math.Round(materialReductionPercent, 1),
            printabilityScore,
            supportRisk,
            warnings,
            true);
    }
}
