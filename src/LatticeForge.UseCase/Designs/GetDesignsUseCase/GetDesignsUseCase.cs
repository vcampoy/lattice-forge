using LatticeForge.Domain.Repositories;
using LatticeForge.UseCase.Designs.GetDesignsUseCase.Dtos;
using LatticeForge.UseCase.Designs.Helpers;

namespace LatticeForge.UseCase.Designs.GetDesignsUseCase;

public interface IGetDesignsUseCase
{
    Task<GetDesignsResponse> ExecuteAsync(GetDesignsRequest request, CancellationToken cancellationToken);
}

public sealed class GetDesignsUseCaseImpl(IDesignRepository repository) : IGetDesignsUseCase
{
    public async Task<GetDesignsResponse> ExecuteAsync(
        GetDesignsRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        IReadOnlyList<GetDesignsResponse.DesignDto> designs = (await repository.ListAsync(cancellationToken))
            .OrderByDescending(design => design.UpdatedAt)
            .ThenByDescending(design => design.CreatedAt)
            .Select(DesignValidationHelper.ValidateStored)
            .Select(design => new GetDesignsResponse.DesignDto(
                design.Id,
                design.Name,
                design.CreatedAt,
                design.UpdatedAt,
                design.Parameters,
                design.MaterialId,
                design.Process,
                design.SchemaVersion))
            .ToArray();

        return new GetDesignsResponse(designs);
    }
}
