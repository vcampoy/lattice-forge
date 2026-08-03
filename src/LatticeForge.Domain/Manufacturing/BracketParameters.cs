namespace LatticeForge.Domain.Manufacturing;

public sealed record BracketParameters(
    double Length,
    double Height,
    double Depth,
    double WallThickness,
    double HoleRadius,
    double LatticeDensity);
