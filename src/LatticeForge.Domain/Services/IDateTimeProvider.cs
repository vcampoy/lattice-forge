namespace LatticeForge.Domain.Services;

public interface IDateTimeProvider
{
    DateTimeOffset GetDateTimeNow();
}
