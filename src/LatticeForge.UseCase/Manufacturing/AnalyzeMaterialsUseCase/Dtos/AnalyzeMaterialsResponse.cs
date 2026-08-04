namespace LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase.Dtos;

public sealed record AnalyzeMaterialsResponse(
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
