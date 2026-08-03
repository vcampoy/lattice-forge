using LatticeForge.Domain.Designs;

namespace LatticeForge.UseCase.Designs;

public interface IDesignUseCase
{
    Task<SavedDesign> CreateAsync(CreateDesignCommand command, CancellationToken cancellationToken);

    Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken);

    Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken);
}
