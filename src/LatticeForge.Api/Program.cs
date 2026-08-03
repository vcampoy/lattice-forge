using System.Text.Json.Serialization;
using LatticeForge.Api.Endpoints;
using LatticeForge.Infrastructure.Persistence;
using LatticeForge.UseCase.Designs;
using LatticeForge.UseCase.Manufacturing;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IManufacturingUseCase, ManufacturingUseCase>();
builder.Services.AddScoped<IDesignUseCase, DesignUseCase>();
string designConnection = builder.Configuration.GetConnectionString("Designs")
    ?? $"Data Source={Path.Combine(AppContext.BaseDirectory, "latticeforge.db")}";
builder.Services.AddLatticeForgeInfrastructure(designConnection);
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

WebApplication app = builder.Build();
app.Services.InitializeLatticeForgeDatabase();

app.MapHealthEndpoints();
app.MapManufacturingEndpoints();
app.MapDesignEndpoints();

app.Run();

public partial class Program
{
}
