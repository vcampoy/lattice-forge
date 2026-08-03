using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Designs;

public sealed record CreateDesignCommand(
    string Name,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion);
