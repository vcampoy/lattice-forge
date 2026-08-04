using LatticeForge.Domain.Repositories;
using LatticeForge.UseCase.Designs.GetDesign.Dtos;
using LatticeForge.UseCase.Designs.Helpers;

namespace LatticeForge.UseCase.Designs.GetDesign;

public interface IGetDesignUseCase
{
    Task<GetDesignResponse?> ExecuteAsync(GetDesignRequest request, CancellationToken cancellationToken);
}

public sealed class GetDesignUseCase(IDesignRepository repository) : IGetDesignUseCase
{
    public async Task<GetDesignResponse?> ExecuteAsync(
        GetDesignRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var design = await repository.GetAsync(request.Id, cancellationToken);
        if (design is null)
        {
            return null;
        }

        design = DesignValidationHelper.ValidateStored(design);
        return new GetDesignResponse(new GetDesignResponse.DesignDto(
            design.Id,
            design.Name,
            design.CreatedAt,
            design.UpdatedAt,
            design.Parameters,
            design.MaterialId,
            design.Process,
            design.SchemaVersion));
    }
}
