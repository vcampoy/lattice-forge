using LatticeForge.Services.Designs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LatticeForge.Infrastructure.Persistence;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddLatticeForgeInfrastructure(
        this IServiceCollection services,
        string designConnection)
    {
        services.AddDbContext<DesignDbContext>(options => options.UseSqlite(designConnection));
        services.AddScoped<IDesignRepository, DesignRepository>();
        return services;
    }

    public static void InitializeLatticeForgeDatabase(this IServiceProvider services)
    {
        using IServiceScope scope = services.CreateScope();
        scope.ServiceProvider.GetRequiredService<DesignDbContext>().Database.EnsureCreated();
    }
}
