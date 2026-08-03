namespace LatticeForge.Api.Manufacturing;

public sealed record MaterialProfile(
    string Id,
    string Name,
    ManufacturingProcess Process,
    double Density,
    double CostPerKg,
    double MinimumWallThickness,
    double DepositionRate);
