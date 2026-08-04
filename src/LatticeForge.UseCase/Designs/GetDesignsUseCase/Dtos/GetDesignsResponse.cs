using LatticeForge.Domain.Manufacturing;

namespace LatticeForge.UseCase.Designs.GetDesignsUseCase.Dtos;

public sealed record GetDesignsResponse(IReadOnlyList<GetDesignsResponse.DesignDto> Designs)
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
