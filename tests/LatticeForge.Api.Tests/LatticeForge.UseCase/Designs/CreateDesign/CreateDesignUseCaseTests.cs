using LatticeForge.Domain.Dtos.Designs;
using LatticeForge.Domain.Dtos.Manufacturing;
using LatticeForge.Domain.Repositories;
using LatticeForge.Domain.Services;
using LatticeForge.UseCase.Designs.CreateDesign;
using LatticeForge.UseCase.Designs.CreateDesign.Dtos;

namespace LatticeForge.Api.Tests.LatticeForge.UseCase.Designs;

public sealed class CreateDesignUseCaseTests
{
    private static readonly BracketParameters ValidParameters = new(120, 80, 40, 4, 8, 0.5);
    private static readonly DateTimeOffset FixedNow = new(2025, 1, 2, 3, 4, 5, TimeSpan.Zero);

    [Fact]
    public async Task ExecuteAsync_should_trim_name_and_persist_design_when_request_is_valid()
    {
        RecordingDesignRepository repository = new();
        CreateDesignUseCase useCase = new(repository, new FixedDateTimeProvider());
        CreateDesignRequest request = new(
            "  Bracket baseline  ",
            ValidParameters,
            "aluminum-sls",
            ManufacturingProcess.Sls,
            1);

        CreateDesignResponse result = await useCase.ExecuteAsync(request, CancellationToken.None);

        Assert.Equal("Bracket baseline", result.Name);
        Assert.NotNull(repository.CreatedDesign);
        Assert.Equal(result.Id, repository.CreatedDesign.Id);
        Assert.Equal(FixedNow, result.CreatedAt);
        Assert.Equal(FixedNow, result.UpdatedAt);
    }

    [Fact]
    public void ExecuteAsync_should_reject_blank_name_when_request_is_invalid()
    {
        CreateDesignUseCase useCase = new(new RecordingDesignRepository(), new FixedDateTimeProvider());

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.ExecuteAsync(
                new CreateDesignRequest(
                    "   ",
                    ValidParameters,
                    "aluminum-sls",
                    ManufacturingProcess.Sls,
                    1),
                CancellationToken.None).GetAwaiter().GetResult());

        Assert.Contains("Design name", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ExecuteAsync_should_reject_unsupported_schema_version_when_request_is_invalid()
    {
        CreateDesignUseCase useCase = new(new RecordingDesignRepository(), new FixedDateTimeProvider());

        ArgumentException exception = Assert.Throws<ArgumentException>(() =>
            useCase.ExecuteAsync(
                new CreateDesignRequest(
                    "Bracket",
                    ValidParameters,
                    "aluminum-sls",
                    ManufacturingProcess.Sls,
                    99),
                CancellationToken.None).GetAwaiter().GetResult());

        Assert.Contains("schema version", exception.Message, StringComparison.Ordinal);
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

    private sealed class FixedDateTimeProvider : IDateTimeProvider
    {
        public DateTimeOffset GetDateTimeNow() => FixedNow;
    }
}
