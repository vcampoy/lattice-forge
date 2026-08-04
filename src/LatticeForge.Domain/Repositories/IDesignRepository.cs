using LatticeForge.Domain.Dtos.Designs;

namespace LatticeForge.Domain.Repositories;

public interface IDesignRepository
{
    Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken);

    Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken);

    Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken);
}
