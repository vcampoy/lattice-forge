using LatticeForge.Domain.Designs;
using LatticeForge.Domain.Manufacturing;
using LatticeForge.Domain.Repositories;
using LatticeForge.UseCase.Designs.GetDesignsUseCase;
using LatticeForge.UseCase.Designs.GetDesignsUseCase.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Designs;

public sealed class GetDesignsUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_should_order_designs_by_updated_then_created_timestamp()
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        SavedDesign first = CreateDesign(Guid.NewGuid(), "First", now.AddMinutes(-2), now.AddMinutes(-2));
        SavedDesign second = CreateDesign(Guid.NewGuid(), "Second", now.AddMinutes(-1), now.AddMinutes(-1));
        GetDesignsUseCaseImpl useCase = new(new RecordingDesignRepository([first, second]));

        GetDesignsResponse result = await useCase.ExecuteAsync(new GetDesignsRequest(), CancellationToken.None);

        Assert.Equal(["Second", "First"], result.Designs.Select(design => design.Name));
    }

    [Fact]
    public void ExecuteAsync_should_reject_corrupted_stored_design_when_validation_fails()
    {
        SavedDesign invalid = CreateDesign(Guid.NewGuid(), "Invalid", DateTimeOffset.UtcNow, DateTimeOffset.UtcNow) with
        {
            Parameters = new BracketParameters(120, 80, 40, 4, 8, 2)
        };
        GetDesignsUseCaseImpl useCase = new(new RecordingDesignRepository([invalid]));

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.ExecuteAsync(new GetDesignsRequest(), CancellationToken.None).GetAwaiter().GetResult());

        Assert.Contains("Lattice density", exception.Message, StringComparison.Ordinal);
    }

    private static SavedDesign CreateDesign(Guid id, string name, DateTimeOffset createdAt, DateTimeOffset updatedAt) =>
        new(id, name, createdAt, updatedAt, new BracketParameters(120, 80, 40, 4, 8, 0.5), "aluminum-sls", ManufacturingProcess.Sls, 1);

    private sealed class RecordingDesignRepository(IReadOnlyList<SavedDesign> designs) : IDesignRepository
    {
        public Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken) =>
            Task.FromResult(design);

        public Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult(designs);

        public Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<SavedDesign?>(null);
    }
}
