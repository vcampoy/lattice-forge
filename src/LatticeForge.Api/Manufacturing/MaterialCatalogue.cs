namespace LatticeForge.Api.Manufacturing;

public static class MaterialCatalogue
{
    public static readonly MaterialProfile[] All =
    [
        new("aluminum-sls", "Aluminium PA", ManufacturingProcess.Sls, 1.04, 68, 1.2, 7.5),
        new("resin-sla", "Clear Resin", ManufacturingProcess.Sla, 1.1, 92, 0.8, 2.2),
        new("titanium-lpbf", "Titanium Ti-6Al-4V", ManufacturingProcess.MetalLpbf, 4.43, 185, 0.6, 1.1)
    ];
}
