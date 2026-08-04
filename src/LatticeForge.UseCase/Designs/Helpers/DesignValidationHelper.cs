using LatticeForge.Domain.Dtos.Designs;
using LatticeForge.Domain.Dtos.Manufacturing;
using LatticeForge.UseCase.Manufacturing.Helpers;

namespace LatticeForge.UseCase.Designs.Helpers;

public static class DesignValidationHelper
{
    public const int CurrentSchemaVersion = 1;

    public static void ValidateCreate(
        string name,
        BracketParameters parameters,
        string materialId,
        ManufacturingProcess process,
        int schemaVersion)
    {
        ValidateName(name, "Design name must contain between 1 and 80 characters.", "command");

        if (schemaVersion != CurrentSchemaVersion)
        {
            throw new ArgumentException($"Design schema version must be {CurrentSchemaVersion}.", "command");
        }

        ManufacturingValidationHelper.Validate(parameters, materialId, process);
    }

    public static SavedDesign ValidateStored(SavedDesign design)
    {
        ValidateName(design.Name, "Stored design name is invalid.", nameof(design));

        if (design.SchemaVersion != CurrentSchemaVersion)
        {
            throw new ArgumentException($"Stored design schema version must be {CurrentSchemaVersion}.", nameof(design));
        }

        ManufacturingValidationHelper.Validate(design.Parameters, design.MaterialId, design.Process);
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
