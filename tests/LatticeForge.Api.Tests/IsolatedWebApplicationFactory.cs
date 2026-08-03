using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace LatticeForge.Api.Tests;

public sealed class IsolatedWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"lattice-forge-test-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Designs", $"Data Source={_databasePath}")
            .ConfigureLogging(logging => logging.ClearProviders());
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing)
        {
            try
            {
                File.Delete(_databasePath);
            }
            catch (IOException)
            {
                // The test host can release SQLite's native handle after disposal; the unique file is safe to leave in the OS temp directory.
            }
        }
    }
}
