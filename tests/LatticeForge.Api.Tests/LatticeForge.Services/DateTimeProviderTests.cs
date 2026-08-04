using LatticeForge.Domain.Services;
using LatticeForge.Services;

namespace LatticeForge.Api.Tests.LatticeForge.Services;

public sealed class DateTimeProviderTests
{
    [Fact]
    public void GetDateTimeNow_should_return_utc_time()
    {
        IDateTimeProvider provider = new DateTimeProvider();

        DateTimeOffset result = provider.GetDateTimeNow();

        Assert.Equal(TimeSpan.Zero, result.Offset);
    }
}
