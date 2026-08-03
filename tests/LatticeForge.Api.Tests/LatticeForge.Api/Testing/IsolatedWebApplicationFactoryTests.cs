using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LatticeForge.Api.Tests.LatticeForge.Api.Testing;

public sealed class IsolatedWebApplicationFactoryTests
{
    private static readonly string[] DatabaseFileSuffixes = [string.Empty, "-wal", "-shm"];

    [Fact]
    public void Dispose_should_delete_database_files_when_path_is_factory_owned()
    {
        string? databasePath = null;

        try
        {
            using (IsolatedWebApplicationFactory factory = new())
            {
                databasePath = GetDatabasePath(factory);
                AssertDatabaseFilesExist(databasePath);
            }

            AssertDatabaseFilesDoNotExist(databasePath);
        }
        finally
        {
            DeleteDatabaseFiles(databasePath);
        }
    }

    [Fact]
    public void Dispose_should_preserve_database_files_when_path_is_caller_supplied()
    {
        string databasePath = Path.Combine(
            Path.GetTempPath(),
            $"lattice-forge-caller-owned-{Guid.NewGuid():N}.db");

        try
        {
            using (IsolatedWebApplicationFactory factory = new(databasePath))
            {
                _ = GetDatabasePath(factory);
                AssertDatabaseFilesExist(databasePath);
            }

            AssertDatabaseFilesExist(databasePath);
        }
        finally
        {
            DeleteDatabaseFiles(databasePath);
        }
    }

    private static string GetDatabasePath(IsolatedWebApplicationFactory factory)
    {
        IConfiguration configuration = factory.Services.GetRequiredService<IConfiguration>();
        string connectionString = configuration.GetConnectionString("Designs")
            ?? throw new InvalidOperationException("The test database connection string is missing.");

        return new SqliteConnectionStringBuilder(connectionString).DataSource;
    }

    private static void AssertDatabaseFilesExist(string databasePath)
    {
        foreach (string suffix in DatabaseFileSuffixes)
        {
            Assert.True(File.Exists(databasePath + suffix));
        }
    }

    private static void AssertDatabaseFilesDoNotExist(string databasePath)
    {
        foreach (string suffix in DatabaseFileSuffixes)
        {
            Assert.False(File.Exists(databasePath + suffix));
        }
    }

    private static void DeleteDatabaseFiles(string? databasePath)
    {
        if (databasePath is null)
        {
            return;
        }

        SqliteConnection.ClearAllPools();
        foreach (string suffix in DatabaseFileSuffixes)
        {
            File.Delete(databasePath + suffix);
        }
    }
}
