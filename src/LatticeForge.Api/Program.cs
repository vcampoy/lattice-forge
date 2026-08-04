using System.Text.Json.Serialization;
using LatticeForge.Domain.Repositories;
using LatticeForge.Infrastructure.Persistence;
using LatticeForge.Services.Designs.Repositories;
using LatticeForge.UseCase.Designs.CreateDesignUseCase;
using LatticeForge.UseCase.Designs.GetDesignUseCase;
using LatticeForge.UseCase.Designs.GetDesignsUseCase;
using LatticeForge.UseCase.Health.GetHealthUseCase;
using LatticeForge.UseCase.Manufacturing.AnalyzeMaterialsUseCase;
using LatticeForge.UseCase.Manufacturing.GetMaterialsUseCase;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IDesignRepository, DesignRepository>();
builder.Services.AddScoped<ICreateDesignUseCase, CreateDesignUseCaseImpl>();
builder.Services.AddScoped<IGetDesignsUseCase, GetDesignsUseCaseImpl>();
builder.Services.AddScoped<IGetDesignUseCase, GetDesignUseCaseImpl>();
builder.Services.AddScoped<IGetMaterialsUseCase, GetMaterialsUseCaseImpl>();
builder.Services.AddScoped<IAnalyzeMaterialsUseCase, AnalyzeMaterialsUseCaseImpl>();
builder.Services.AddScoped<IGetHealthUseCase, GetHealthUseCaseImpl>();
string designConnection = builder.Configuration.GetConnectionString("Designs")
    ?? $"Data Source={Path.Combine(AppContext.BaseDirectory, "latticeforge.db")}";
builder.Services.AddLatticeForgeInfrastructure(designConnection);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddProblemDetails();

WebApplication app = builder.Build();
app.Services.InitializeLatticeForgeDatabase();

app.MapControllers();

app.Run();

public partial class Program
{
}
