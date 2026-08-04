using LatticeForge.UseCase.Manufacturing.AnalyzeMaterials.Dtos;
using LatticeForge.UseCase.Manufacturing.Helpers;

namespace LatticeForge.UseCase.Manufacturing.AnalyzeMaterials;

public interface IAnalyzeMaterialsUseCase
{
    AnalyzeMaterialsResponse Execute(AnalyzeMaterialsRequest request);
}

public sealed class AnalyzeMaterialsUseCase : IAnalyzeMaterialsUseCase
{
    public AnalyzeMaterialsResponse Execute(AnalyzeMaterialsRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        var analysis = ManufacturingAnalysisHelper.Analyze(request.Parameters, request.MaterialId, request.Process);
        return new AnalyzeMaterialsResponse(
            analysis.SolidVolume,
            analysis.OptimizedVolume,
            analysis.EstimatedWeight,
            analysis.EstimatedCost,
            analysis.EstimatedPrintMinutes,
            analysis.MaterialReductionPercent,
            analysis.PrintabilityScore,
            analysis.SupportRisk,
            analysis.Warnings,
            analysis.IllustrativeEstimate);
    }
}
