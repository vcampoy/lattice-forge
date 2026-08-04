namespace LatticeForge.Domain.Dtos.Manufacturing;

public sealed record ManufacturingAnalysis(
    double SolidVolume,
    double OptimizedVolume,
    double EstimatedWeight,
    double EstimatedCost,
    double EstimatedPrintMinutes,
    double MaterialReductionPercent,
    int PrintabilityScore,
    string SupportRisk,
    IReadOnlyList<string> Warnings,
    bool IllustrativeEstimate);
