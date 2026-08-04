using LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase.Dtos;
using LatticeForge.UseCase.Manufacturing.Helpers;

namespace LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase;

public interface IAnalyzeMaterialsUseCase
{
    AnalyzeMaterialsResponse Execute(AnalyzeMaterialsRequest request);
}

public sealed class AnalyzeMaterialsUseCaseImpl : IAnalyzeMaterialsUseCase
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
