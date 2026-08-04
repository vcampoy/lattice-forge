using LatticeForge.Domain.Dtos.Designs;
using LatticeForge.Domain.Dtos.Manufacturing;
using LatticeForge.Domain.Repositories;
using LatticeForge.UseCase.Designs.GetDesign;
using LatticeForge.UseCase.Designs.GetDesign.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Designs;

public sealed class GetDesignUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_should_return_null_response_design_when_identifier_is_not_found()
    {
        GetDesignUseCase useCase = new(new EmptyDesignRepository());

        GetDesignResponse? result = await useCase.ExecuteAsync(
            new GetDesignRequest(Guid.NewGuid()),
            CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task ExecuteAsync_should_return_design_when_identifier_is_found()
    {
        Guid id = Guid.NewGuid();
        SavedDesign design = new(
            id,
            "Bracket",
            DateTimeOffset.UtcNow,
            DateTimeOffset.UtcNow,
            new BracketParameters(120, 80, 40, 4, 8, 0.5),
            "aluminum-sls",
            ManufacturingProcess.Sls,
            1);
        GetDesignUseCase useCase = new(new ExistingDesignRepository(design));

        GetDesignResponse? result = await useCase.ExecuteAsync(
            new GetDesignRequest(id),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result!.Design);
        Assert.Equal(id, result.Design.Id);
    }

    private sealed class EmptyDesignRepository : IDesignRepository
    {
        public Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken) =>
            Task.FromResult(design);

        public Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<SavedDesign>>([]);

        public Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<SavedDesign?>(null);
    }

    private sealed class ExistingDesignRepository(SavedDesign design) : IDesignRepository
    {
        public Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken) =>
            Task.FromResult(design);

        public Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<SavedDesign>>([]);

        public Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<SavedDesign?>(design);
    }
}
