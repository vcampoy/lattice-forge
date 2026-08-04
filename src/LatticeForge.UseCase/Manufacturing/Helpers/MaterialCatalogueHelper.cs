using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.UseCase.Manufacturing.Helpers;

public static class MaterialCatalogueHelper
{
    private static readonly MaterialProfile[] Catalogue =
    [
        new("aluminum-sls", "Aluminium PA", ManufacturingProcess.Sls, 1.04, 68, 1.2, 7.5),
        new("resin-sla", "Clear Resin", ManufacturingProcess.Sla, 1.1, 92, 0.8, 2.2),
        new("titanium-lpbf", "Titanium Ti-6Al-4V", ManufacturingProcess.MetalLpbf, 4.43, 185, 0.6, 1.1)
    ];

    private static readonly IReadOnlyList<MaterialProfile> ReadOnlyCatalogue = Array.AsReadOnly(Catalogue);
    private static readonly IReadOnlyDictionary<string, MaterialProfile> Materials =
        Catalogue.ToDictionary(material => material.Id, StringComparer.OrdinalIgnoreCase);

    public static IReadOnlyList<MaterialProfile> GetMaterials() => ReadOnlyCatalogue;

    public static bool TryGetMaterial(string materialId, out MaterialProfile? material) =>
        Materials.TryGetValue(materialId, out material);
}
