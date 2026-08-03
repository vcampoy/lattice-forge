using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing;

public interface IManufacturingUseCase
{
    IReadOnlyList<MaterialProfile> Materials { get; }

    ManufacturingAnalysis Analyze(
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process);

    void Validate(
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process);
}
