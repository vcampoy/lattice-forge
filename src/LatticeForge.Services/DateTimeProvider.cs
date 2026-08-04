using LatticeForge.Domain.Services;

namespace LatticeForge.Services;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset GetDateTimeNow() => DateTimeOffset.UtcNow;
}
