using LatticeForge.Domain.Designs;

namespace LatticeForge.Services.Designs;

public interface IDesignRepository
{
    Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken);

    Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken);

    Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken);
}
