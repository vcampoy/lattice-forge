using LatticeForge.Domain.Designs;
using LatticeForge.Services.Designs;
using LatticeForge.UseCase.Manufacturing;

namespace LatticeForge.UseCase.Designs;

public sealed class DesignUseCase(
    IDesignRepository repository,
    IManufacturingUseCase manufacturingUseCase) : IDesignUseCase
{
    public const int CurrentSchemaVersion = 1;

    public async Task<SavedDesign> CreateAsync(
        CreateDesignCommand command,
        CancellationToken cancellationToken)
    {
        ValidateCommand(command);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        SavedDesign design = new(
            Guid.NewGuid(),
            command.Name.Trim(),
            now,
            now,
            command.Parameters,
            command.MaterialId,
            command.Process,
            command.SchemaVersion);

        return await repository.CreateAsync(design, cancellationToken);
    }

    public async Task<IReadOnlyList<SavedDesign>> ListAsync(CancellationToken cancellationToken)
    {
        IReadOnlyList<SavedDesign> designs = await repository.ListAsync(cancellationToken);
        return designs
            .OrderByDescending(design => design.UpdatedAt)
            .ThenByDescending(design => design.CreatedAt)
            .Select(ValidateStoredDesign)
            .ToArray();
    }

    public async Task<SavedDesign?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        SavedDesign? design = await repository.GetAsync(id, cancellationToken);
        return design is null ? null : ValidateStoredDesign(design);
    }

    private void ValidateCommand(CreateDesignCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);
        ValidateName(command.Name, "Design name must contain between 1 and 80 characters.", nameof(command));

        if (command.SchemaVersion != CurrentSchemaVersion)
        {
            throw new ArgumentException($"Design schema version must be {CurrentSchemaVersion}.", nameof(command));
        }

        manufacturingUseCase.Validate(command.Parameters, command.MaterialId, command.Process);
    }

    private SavedDesign ValidateStoredDesign(SavedDesign design)
    {
        ValidateName(design.Name, "Stored design name is invalid.", nameof(design));

        if (design.SchemaVersion != CurrentSchemaVersion)
        {
            throw new ArgumentException($"Stored design schema version must be {CurrentSchemaVersion}.", nameof(design));
        }

        manufacturingUseCase.Validate(design.Parameters, design.MaterialId, design.Process);
        return design;
    }

    private static void ValidateName(string name, string message, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 80)
        {
            throw new ArgumentException(message, parameterName);
        }
    }
}
