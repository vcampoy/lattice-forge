using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Designs.GetDesignUseCase.Dtos;

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
