using LatticeForge.Domain.Manufacturing;
using LatticeForge.UseCase.Designs;

namespace LatticeForge.Api.Designs;

public sealed record DesignRequest(
    string Name,
    BracketParameters Parameters,
    string MaterialId,
    ManufacturingProcess Process,
    int SchemaVersion)
{
    public CreateDesignCommand ToCommand() => new(Name, Parameters, MaterialId, Process, SchemaVersion);
}
