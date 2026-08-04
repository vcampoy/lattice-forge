namespace LatticeForge.Api.Tests.LatticeForge.Api.Testing;

internal static class TestContractConstants
{
    internal static readonly string[] DatabaseFileSuffixes = [string.Empty, "-wal", "-shm"];

    internal static readonly string[] ProblemDetailsPropertyNames =
    [
        "type",
        "title",
        "status",
        "detail",
        "traceId"
    ];
}
