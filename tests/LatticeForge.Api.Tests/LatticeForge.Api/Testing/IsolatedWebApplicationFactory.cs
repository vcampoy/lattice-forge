using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace LatticeForge.Api.Tests.LatticeForge.Api.Testing;

public sealed class IsolatedWebApplicationFactory : WebApplicationFactory<Program>
{
    private const int DatabaseFileDeleteAttempts = 10;
    private const int DatabaseFileDeleteRetryDelayMilliseconds = 50;
    private readonly string _databasePath;
    private readonly bool _ownsDatabasePath;

    public IsolatedWebApplicationFactory()
        : this(
            Path.Combine(Path.GetTempPath(), $"lattice-forge-test-{Guid.NewGuid():N}.db"),
            ownsDatabasePath: true)
    {
    }

    internal IsolatedWebApplicationFactory(string databasePath)
        : this(databasePath, ownsDatabasePath: false)
    {
    }

    private IsolatedWebApplicationFactory(string databasePath, bool ownsDatabasePath)
    {
        _databasePath = databasePath;
        _ownsDatabasePath = ownsDatabasePath;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Designs", $"Data Source={_databasePath}")
            .ConfigureLogging(logging => logging.ClearProviders());
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing || !_ownsDatabasePath)
        {
            return;
        }

        SqliteConnection.ClearAllPools();
        DeleteDatabaseFiles(_databasePath);
    }

    private static void DeleteDatabaseFiles(string databasePath)
    {
        for (int attempt = 1; attempt <= DatabaseFileDeleteAttempts; attempt++)
        {
            IOException? lastException = null;
            foreach (string suffix in TestContractConstants.DatabaseFileSuffixes)
            {
                try
                {
                    File.Delete(databasePath + suffix);
                }
                catch (IOException exception)
                {
                    lastException = exception;
                }
            }

            if (lastException is null)
            {
                return;
            }

            if (attempt < DatabaseFileDeleteAttempts)
            {
                Thread.Sleep(DatabaseFileDeleteRetryDelayMilliseconds);
                continue;
            }

            throw new IOException(
                $"Failed to delete the factory-owned SQLite database files for '{databasePath}'.",
                lastException);
        }
    }
}
