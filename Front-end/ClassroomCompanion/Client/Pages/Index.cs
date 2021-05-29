using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components.WebAssembly.Authentication;
using Microsoft.AspNetCore.WebUtilities;
using Radzen;

namespace Client.Pages
{
    public partial class Index
    {
        protected override async Task OnInitializedAsync()
        {
            var uri = _navigationManager.ToAbsoluteUri(_navigationManager.Uri);
            if (QueryHelpers.ParseQuery(uri.Query).TryGetValue("authorization", out var authorization) &&
                authorization.Equals("true"))
            {
                ShowNotification(new NotificationMessage
                {
                    Severity = NotificationSeverity.Success,
                    Summary = "Success",
                    Detail = "Authorization completed successfully. Try again.",
                    Duration = 3000
                });
            }

            Console.WriteLine(await GetAccessTokenAsync());
        }

        private async Task<string> GetAccessTokenAsync()
        {
            var request = await _accessTokenProvider.RequestAccessToken(new AccessTokenRequestOptions
            {
                Scopes = new[]
                {
                    _configuration["AzureAdB2C:Scope"]
                }
            });
            return request.TryGetToken(out var accessToken) ? accessToken.Value : null;
        }

        private void ShowNotification(NotificationMessage message)
        {
            _notificationService.Notify(message);
        }
    }
}