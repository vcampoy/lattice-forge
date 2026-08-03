namespace LatticeForge.Api.Manufacturing;

public sealed class ManufacturingAnalysisService(IReadOnlyList<MaterialProfile> materials)
{
    private const double MillimetresPerCubicCentimetre = 1000;
    private const double MaxDimensionMillimetres = 1000;
    private readonly Dictionary<string, MaterialProfile> _materials = materials
        .ToDictionary(material => material.Id, StringComparer.OrdinalIgnoreCase);

    public ManufacturingAnalysis Analyze(
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process)
    {
        ArgumentNullException.ThrowIfNull(parameters);

        ValidateParameters(parameters);

        if (!_materials.TryGetValue(materialId, out MaterialProfile? material))
        {
            throw new ArgumentException($"Material '{materialId}' was not found.", nameof(materialId));
        }

        if (material.Process != process)
        {
            throw new ArgumentException(
                $"Material '{material.Id}' is not compatible with process '{process}'.",
                nameof(process));
        }

        double wallFactor = 0.22 + Math.Clamp(parameters.WallThickness / 20, 0, 1) * 0.08;
        double envelopeVolumeCubicMillimetres = parameters.Length * parameters.Height * parameters.Depth * wallFactor;
        double holeVolumeCubicMillimetres = Math.PI * Math.Pow(parameters.HoleRadius, 2) * parameters.Depth * 2 * 0.9;
        double solidVolume = Math.Max(0.001, (envelopeVolumeCubicMillimetres - holeVolumeCubicMillimetres) / MillimetresPerCubicCentimetre);

        // Simplified illustrative lattice equation: density 0..1 maps to 30..75% of the solid volume.
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

    private static void ValidateParameters(BracketParameters parameters)
    {
        if (parameters.Length <= 0 || parameters.Length > MaxDimensionMillimetres)
        {
            throw new ArgumentException("Length must be greater than 0 and no more than 1000 mm.", nameof(parameters));
        }

        if (parameters.Height <= 0 || parameters.Height > MaxDimensionMillimetres)
        {
            throw new ArgumentException("Height must be greater than 0 and no more than 1000 mm.", nameof(parameters));
        }

        if (parameters.Depth <= 0 || parameters.Depth > MaxDimensionMillimetres)
        {
            throw new ArgumentException("Depth must be greater than 0 and no more than 1000 mm.", nameof(parameters));
        }

        if (parameters.WallThickness <= 0 || parameters.WallThickness > Math.Min(parameters.Length, Math.Min(parameters.Height, parameters.Depth)) / 2)
        {
            throw new ArgumentException("Wall thickness must be positive and fit within the bracket dimensions.", nameof(parameters));
        }

        if (parameters.HoleRadius <= 0 || parameters.HoleRadius >= Math.Min(parameters.Length, parameters.Height) / 2)
        {
            throw new ArgumentException("Hole radius must be positive and fit within the bracket face.", nameof(parameters));
        }

        if (parameters.LatticeDensity is < 0 or > 1)
        {
            throw new ArgumentException("Lattice density must be between 0 and 1.", nameof(parameters));
        }
    }
}
