using LatticeForge.Domain.Dtos.Designs;
using LatticeForge.Domain.Repositories;
using LatticeForge.Domain.Services;
using LatticeForge.UseCase.Designs.CreateDesign.Dtos;
using LatticeForge.UseCase.Designs.Helpers;

namespace LatticeForge.UseCase.Designs.CreateDesign;

public interface ICreateDesignUseCase
{
    Task<CreateDesignResponse> ExecuteAsync(CreateDesignRequest request, CancellationToken cancellationToken);
}

public sealed class CreateDesignUseCase(IDesignRepository repository, IDateTimeProvider dateTimeProvider) : ICreateDesignUseCase
{
    public async Task<CreateDesignResponse> ExecuteAsync(
        CreateDesignRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        DesignValidationHelper.ValidateCreate(
            request.Name,
            request.Parameters,
            request.MaterialId,
            request.Process,
            request.SchemaVersion);

        DateTimeOffset now = dateTimeProvider.GetDateTimeNow();
        SavedDesign design = new(
            Guid.NewGuid(),
            request.Name.Trim(),
            now,
            now,
            request.Parameters,
            request.MaterialId,
            request.Process,
            request.SchemaVersion);

        SavedDesign createdDesign = await repository.CreateAsync(design, cancellationToken);
        return new CreateDesignResponse(
            createdDesign.Id,
            createdDesign.Name,
            createdDesign.CreatedAt,
            createdDesign.UpdatedAt,
            createdDesign.Parameters,
            createdDesign.MaterialId,
            createdDesign.Process,
            createdDesign.SchemaVersion);
    }
}
