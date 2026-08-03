using LatticeForge.Domain.Designs;
using LatticeForge.Domain.Manufacturing;
using LatticeForge.Services.Designs;
using LatticeForge.UseCase.Designs;
using LatticeForge.UseCase.Manufacturing;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Designs;

public sealed class DesignUseCaseTests
{
    private static readonly BracketParameters ValidParameters = new(120, 80, 40, 4, 8, 0.5);

    [Fact]
    public async Task CreateAsync_should_trim_name_and_persist_design_when_command_is_valid()
    {
        RecordingDesignRepository repository = new();
        DesignUseCase useCase = new(repository, new ManufacturingUseCase());
        CreateDesignCommand command = new(
            "  Bracket baseline  ",
            ValidParameters,
            "aluminum-sls",
            ManufacturingProcess.Sls,
            DesignUseCase.CurrentSchemaVersion);

        SavedDesign result = await useCase.CreateAsync(command, CancellationToken.None);

        Assert.Equal("Bracket baseline", result.Name);
        Assert.Same(result, repository.CreatedDesign);
        Assert.NotEqual(Guid.Empty, result.Id);
    }

    private sealed class RecordingDesignRepository : IDesignRepository
    {
        public SavedDesign? CreatedDesign { get; private set; }

        public Task<SavedDesign> CreateAsync(SavedDesign design, CancellationToken cancellationToken)
        {
            CreatedDesign = design;
            return Task.FromResult(design);
        }

        public Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<SavedDesign>>([]);

        public Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult<SavedDesign?>(null);
    }
}
