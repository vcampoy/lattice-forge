using System.Text.Json.Serialization;
using LatticeForge.Domain.Repositories;
using LatticeForge.Domain.Services;
using LatticeForge.Infrastructure.Persistence;
using LatticeForge.Services.Repositories;
using LatticeForge.Services;
using LatticeForge.UseCase.Designs.CreateDesign;
using LatticeForge.UseCase.Designs.GetDesign;
using LatticeForge.UseCase.Designs.GetDesigns;
using LatticeForge.UseCase.Health.GetHealth;
using LatticeForge.UseCase.Manufacturing.AnalyzeMaterials;
using LatticeForge.UseCase.Manufacturing.GetMaterials;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IDesignRepository, DesignRepository>();
builder.Services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
builder.Services.AddScoped<ICreateDesignUseCase, CreateDesignUseCase>();
builder.Services.AddScoped<IGetDesignsUseCase, GetDesignsUseCase>();
builder.Services.AddScoped<IGetDesignUseCase, GetDesignUseCase>();
builder.Services.AddScoped<IGetMaterialsUseCase, GetMaterialsUseCase>();
builder.Services.AddScoped<IAnalyzeMaterialsUseCase, AnalyzeMaterialsUseCase>();
builder.Services.AddScoped<IGetHealthUseCase, GetHealthUseCase>();
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
