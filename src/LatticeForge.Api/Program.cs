using System.Text.Json.Serialization;
using LatticeForge.Infrastructure.Persistence;
using LatticeForge.UseCase.Designs;
using LatticeForge.UseCase.Manufacturing;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IManufacturingUseCase, ManufacturingUseCase>();
builder.Services.AddScoped<IDesignUseCase, DesignUseCase>();
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
