using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.Api.Manufacturing;

public sealed record AnalysisRequest(
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process);
