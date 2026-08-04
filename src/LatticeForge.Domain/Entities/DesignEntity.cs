using LatticeForge.Domain.Dtos.Manufacturing;

namespace LatticeForge.Domain.Entities;

public sealed class DesignEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public double Length { get; set; }
    public double Height { get; set; }
    public double Depth { get; set; }
    public double WallThickness { get; set; }
    public double HoleRadius { get; set; }
    public double LatticeDensity { get; set; }
    public string MaterialId { get; set; } = string.Empty;
    public ManufacturingProcess Process { get; set; }
    public int SchemaVersion { get; set; }
}
