using LatticeForge.Api.Tests.LatticeForge.Api.Testing;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace LatticeForge.Api.Tests.LatticeForge.Api.Controllers;

public sealed class ControllerRoutingTests
{
    private static readonly ExpectedControllerAction[] ExpectedActions =
    [
        new("Design", "CreateDesign", "POST", "api/designs", "CreateDesign"),
        new("Design", "GetDesign", "GET", "api/designs/{id:guid}", "GetDesign"),
        new("Design", "GetDesigns", "GET", "api/designs", "GetDesigns"),
        new("Health", "GetHealth", "GET", "api/health", "GetHealth"),
        new("Manufacturing", "CreateManufacturingAnalysis", "POST", "api/analyses", "CreateManufacturingAnalysis"),
        new("Manufacturing", "GetMaterials", "GET", "api/materials", "GetMaterials")
    ];

    [Fact]
    public void Controllers_should_expose_existing_routes_when_application_starts()
    {
        using IsolatedWebApplicationFactory factory = new();
        IActionDescriptorCollectionProvider provider = factory.Services
            .GetRequiredService<IActionDescriptorCollectionProvider>();

        ExpectedControllerAction[] actions = provider.ActionDescriptors.Items
            .OfType<ControllerActionDescriptor>()
            .Select(ToExpectedControllerAction)
            .OrderBy(action => action.Controller, StringComparer.Ordinal)
            .ThenBy(action => action.Action, StringComparer.Ordinal)
            .ToArray();

        Assert.Equal(ExpectedActions, actions);
    }

    private static ExpectedControllerAction ToExpectedControllerAction(
        ControllerActionDescriptor descriptor)
    {
        string method = descriptor.ActionConstraints?
            .OfType<HttpMethodActionConstraint>()
            .Single()
            .HttpMethods
            .Single()
            ?? throw new InvalidOperationException("The controller action HTTP method is missing.");
        string template = descriptor.AttributeRouteInfo?.Template
            ?? throw new InvalidOperationException("The controller action route template is missing.");
        string name = descriptor.AttributeRouteInfo.Name
            ?? throw new InvalidOperationException("The controller action endpoint name is missing.");

        return new ExpectedControllerAction(
            descriptor.ControllerName,
            descriptor.ActionName,
            method,
            template,
            name);
    }

    private sealed record ExpectedControllerAction(
        string Controller,
        string Action,
        string Method,
        string Route,
        string Name);
}
