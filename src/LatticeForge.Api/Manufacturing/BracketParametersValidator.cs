namespace LatticeForge.Api.Manufacturing;

public static class BracketParametersValidator
{
    public const double MaxDimensionMillimetres = 1000;

    public static void Validate(BracketParameters parameters)
    {
        ArgumentNullException.ThrowIfNull(parameters);

        ValidateDimension(parameters.Length, "Length");
        ValidateDimension(parameters.Height, "Height");
        ValidateDimension(parameters.Depth, "Depth");

        if (!double.IsFinite(parameters.WallThickness)
            || parameters.WallThickness <= 0
            || parameters.WallThickness > Math.Min(parameters.Length, Math.Min(parameters.Height, parameters.Depth)) / 2)
        {
            throw new ArgumentException("Wall thickness must be positive and fit within the bracket dimensions.", nameof(parameters));
        }

        if (!double.IsFinite(parameters.HoleRadius)
            || parameters.HoleRadius <= 0
            || parameters.HoleRadius >= Math.Min(parameters.Length, parameters.Height) / 2)
        {
            throw new ArgumentException("Hole radius must be positive and fit within the bracket face.", nameof(parameters));
        }

        if (!double.IsFinite(parameters.LatticeDensity) || parameters.LatticeDensity is < 0 or > 1)
        {
            throw new ArgumentException("Lattice density must be between 0 and 1.", nameof(parameters));
        }
    }

    private static void ValidateDimension(double value, string name)
    {
        if (!double.IsFinite(value) || value <= 0 || value > MaxDimensionMillimetres)
        {
            throw new ArgumentException($"{name} must be greater than 0 and no more than 1000 mm.", name);
        }
    }
}
