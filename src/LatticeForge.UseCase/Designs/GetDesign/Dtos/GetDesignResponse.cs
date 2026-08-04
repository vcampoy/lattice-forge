using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.UseCase.Designs.GetDesign.Dtos;

public sealed record GetDesignResponse(GetDesignResponse.DesignDto? Design)
{
    public sealed record DesignDto(
        Guid Id,
        string Name,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        BracketParameters Parameters,
        string MaterialId,
        ManufacturingProcess Process,
        int SchemaVersion);
}
