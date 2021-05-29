using System;
using System.Net.Http;
using System.Threading.Tasks;
using Blazored.LocalStorage;
using Client.Utility;
using Microsoft.AspNetCore.Components.WebAssembly.Authentication;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Radzen;

namespace Client
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);
            builder.RootComponents.Add<App>("#app");

            builder.Services.AddScoped(_ => new HttpClient
            {
                BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
            });

            builder.Services.AddScoped(sp => sp.GetRequiredService<IHttpClientFactory>()
                .CreateClient("API"));

            builder.Services.AddHttpClient("API", client =>
                {
                    client.BaseAddress =
                        new Uri(builder.Configuration["ApiUrl"] ?? string.Empty);
                })
                .AddHttpMessageHandler(sp => sp.GetRequiredService<AuthorizationMessageHandler>()
                    .ConfigureHandler(new[] {builder.Configuration["ApiUrl"]},
                        new[] {builder.Configuration["AzureAdB2C:Scope"]}));

            builder.Services.AddMsalAuthentication(options =>
            {
                builder.Configuration.Bind("AzureAdB2C", options.ProviderOptions.Authentication);
            });

            builder.Services.AddScoped<IdService>();
            builder.Services.AddBlazoredLocalStorage();

            builder.Services.AddScoped<NotificationService>();
            builder.Services.AddScoped<DialogService>();

            await builder.Build().RunAsync();
        }
    }
}