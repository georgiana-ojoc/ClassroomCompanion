using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using Client.Models;
using Client.Utility;
using Microsoft.AspNetCore.Components.Authorization;
using Radzen;

namespace Client.Pages
{
    public partial class StudentClassroom
    {
        private Guid _classroomId;
        private Classroom _classroom;
        private IList<Schedule> _schedules;
        private IList<Announcement> _informativeAnnouncements;
        private IList<Announcement> _importantAnnouncements;

        protected override async Task OnInitializedAsync()
        {
            _classroomId = await _idService.GetProfessorClassroomId();
            _classroom = await _client.GetFromJsonAsync<Classroom>($"{Path.Classrooms}/{_classroomId}");
            _schedules = await _client.GetFromJsonAsync<IList<Schedule>>($"{Path.Classrooms}/{_classroomId}/" +
                                                                         $"{Path.Schedules}");
            if (_schedules != null)
            {
                foreach (var schedule in _schedules)
                {
                    schedule.LinkDisabled = true;
                    schedule.AddToCalendarDisabled = false;
                    schedule.RemoveFromCalendarDisabled = true;
                }
            }

            _informativeAnnouncements = await _client.GetFromJsonAsync<IList<Announcement>>(
                $"{Path.Classrooms}/{_classroomId}/{Path.Announcements}?severity=informative");
            if (_informativeAnnouncements != null)
            {
                foreach (var announcement in _informativeAnnouncements)
                {
                    announcement.LinkDisabled = announcement.MeetingId == null;
                }
            }

            _importantAnnouncements = await _client.GetFromJsonAsync<IList<Announcement>>(
                $"{Path.Classrooms}/{_classroomId}/{Path.Announcements}?severity=important");
            if (_importantAnnouncements != null)
            {
                foreach (var announcement in _importantAnnouncements)
                {
                    announcement.LinkDisabled = announcement.MeetingId == null;
                }
            }
        }

        private async Task AddToCalendar(Schedule schedule)
        {
            var eventResponse = await _client.PostAsJsonAsync($"{Path.Calendar}", new Event
            {
                Title = $"{_classroom.Name} {_classroom.Subject}",
                Day = schedule.Day,
                Start = schedule.Start,
                End = schedule.End
            });
            if (eventResponse.IsSuccessStatusCode)
            {
                schedule.AddToCalendarDisabled = true;
                schedule.RemoveFromCalendarDisabled = false;
                var createdEvent = await eventResponse.Content.ReadFromJsonAsync<Event>();
                if (createdEvent != null)
                {
                    schedule.EventId = createdEvent.Id;
                    schedule.EventLink = createdEvent.Link;
                    schedule.LinkDisabled = false;
                    StateHasChanged();
                }
            }
            else
            {
                AuthenticationState authenticationState = await _authenticationStateProvider
                    .GetAuthenticationStateAsync();
                ClaimsPrincipal user = authenticationState.User;
                if (user.Identity is {IsAuthenticated: true})
                {
                    var email = user.FindFirst("emails")?.Value;
                    email = email?.Substring(2, email.Length - 4);
                    var authorizationResponse = await _client.GetAsync($"oauth?email={email}&scope=" +
                                                                       "https://www.googleapis.com/auth/calendar" +
                                                                       "&callback=https://localhost:5001");
                    if (authorizationResponse.IsSuccessStatusCode)
                    {
                        _navigationManager.NavigateTo(await authorizationResponse
                            .Content.ReadAsStringAsync());
                    }
                    else
                    {
                        ShowNotification(new NotificationMessage
                        {
                            Severity = NotificationSeverity.Error,
                            Summary = "Error",
                            Detail = "Something went wrong. Try again.",
                            Duration = 3000
                        });
                    }
                }
            }
        }

        private async Task RemoveFromCalendar(Schedule schedule)
        {
            var response = await _client.DeleteAsync($"{Path.Calendar}/{schedule.EventId}");
            if (response.IsSuccessStatusCode)
            {
                schedule.LinkDisabled = true;
                schedule.AddToCalendarDisabled = false;
                schedule.RemoveFromCalendarDisabled = true;
                StateHasChanged();
            }
            else
            {
                var error = await response.Content.ReadFromJsonAsync<Error>();
                if (error is {Message: { }})
                {
                    ShowNotification(new NotificationMessage
                    {
                        Severity = NotificationSeverity.Error,
                        Summary = "Error",
                        Detail = error.Message,
                        Duration = 3000
                    });
                }
            }
        }

        private void ShowNotification(NotificationMessage message)
        {
            _notificationService.Notify(message);
        }
    }
}