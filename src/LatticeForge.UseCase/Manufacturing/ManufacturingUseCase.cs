using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing;

public sealed class ManufacturingUseCase : IManufacturingUseCase
{
    private const double MillimetresPerCubicCentimetre = 1000;
    private static readonly MaterialProfile[] Catalogue =
    [
        new("aluminum-sls", "Aluminium PA", ManufacturingProcess.Sls, 1.04, 68, 1.2, 7.5),
        new("resin-sla", "Clear Resin", ManufacturingProcess.Sla, 1.1, 92, 0.8, 2.2),
        new("titanium-lpbf", "Titanium Ti-6Al-4V", ManufacturingProcess.MetalLpbf, 4.43, 185, 0.6, 1.1)
    ];
    private static readonly IReadOnlyList<MaterialProfile> ReadOnlyCatalogue = Array.AsReadOnly(Catalogue);
    private readonly Dictionary<string, MaterialProfile> _materials = Catalogue
        .ToDictionary(material => material.Id, StringComparer.OrdinalIgnoreCase);

    public IReadOnlyList<MaterialProfile> Materials => ReadOnlyCatalogue;

    public ManufacturingAnalysis Analyze(
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process)
    {
        ArgumentNullException.ThrowIfNull(parameters);
        Validate(parameters, materialId, process);

        MaterialProfile material = _materials[materialId];
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

    public void Validate(
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process)
    {
        BracketParametersValidator.Validate(parameters);

        if (string.IsNullOrWhiteSpace(materialId) || !_materials.TryGetValue(materialId, out MaterialProfile? material))
        {
            throw new ArgumentException($"Material '{materialId}' was not found.", nameof(materialId));
        }

        if (material.Process != process)
        {
            throw new ArgumentException(
                $"Material '{material.Id}' is not compatible with process '{process}'.",
                nameof(process));
        }
    }
}
