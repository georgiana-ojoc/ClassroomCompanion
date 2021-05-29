using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using Client.Models;
using Client.Utility;
using Microsoft.AspNetCore.Components.Authorization;
using Radzen;

namespace Client.Pages
{
    public partial class ProfessorClassroom
    {
        private Guid _classroomId;
        private Classroom _classroom;
        private bool _addScheduleCollapsed = true;
        private bool _addAnnouncementCollapsed = true;
        private bool _addMeetingCheckBox;
        private bool _addMeetingCollapsed = true;

        private Requests.Schedule _newSchedule = new()
        {
            Day = "Monday",
            Start = DateTime.Parse("00:00"),
            End = DateTime.Parse("00:00")
        };

        private Requests.Announcement _newAnnouncement = new()
        {
            Description = string.Empty,
            Severity = "Informative",
            Date = DateTime.MinValue,
            Start = DateTime.MinValue,
            End = DateTime.MinValue
        };

        private IList<Student> _students;
        private IList<Schedule> _schedules;
        private IList<Announcement> _informativeAnnouncements;
        private IList<Announcement> _importantAnnouncements;

        protected override async Task OnInitializedAsync()
        {
            _classroomId = await _idService.GetProfessorClassroomId();
            _classroom = await _client.GetFromJsonAsync<Classroom>($"{Path.Classrooms}/{_classroomId}");
            _students = await _client.GetFromJsonAsync<IList<Student>>($"{Path.Classrooms}/{_classroomId}/" +
                                                                       $"{Path.Students}");
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

        private async Task AddSchedule()
        {
            var response = await _client.PostAsJsonAsync($"{Path.Classrooms}/{_classroomId}/" +
                                                         $"{Path.Schedules}", new Schedule
            {
                Day = _newSchedule.Day,
                Start = _newSchedule.Start.ToString("HH:mm"),
                End = _newSchedule.End.ToString("HH:mm")
            });
            if (response.IsSuccessStatusCode)
            {
                var newSchedule = await response.Content.ReadFromJsonAsync<Schedule>();
                if (newSchedule != null)
                {
                    newSchedule.LinkDisabled = true;
                    newSchedule.AddToCalendarDisabled = false;
                    newSchedule.RemoveFromCalendarDisabled = true;
                }

                _schedules.Add(newSchedule);
                _addScheduleCollapsed = !_addScheduleCollapsed;
                _newSchedule = new Requests.Schedule()
                {
                    Day = "Monday",
                    Start = DateTime.Parse("00:00"),
                    End = DateTime.Parse("00:00")
                };
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

        private async Task AddAnnouncement()
        {
            if (_addMeetingCheckBox)
            {
                var now = DateTime.Now;
                if (_newAnnouncement.Date < now.Date)
                {
                    ShowNotification(new NotificationMessage
                    {
                        Severity = NotificationSeverity.Error,
                        Summary = "Error",
                        Detail = "Select a future meeting date.",
                        Duration = 3000
                    });
                }
                else
                {
                    if (_newAnnouncement.Date.Date == now.Date && _newAnnouncement.Start.TimeOfDay < now.TimeOfDay)
                    {
                        ShowNotification(new NotificationMessage
                        {
                            Severity = NotificationSeverity.Error,
                            Summary = "Error",
                            Detail = "Select a future meeting start.",
                            Duration = 3000
                        });
                    }
                    else
                    {
                        if (_newAnnouncement.End.TimeOfDay < _newAnnouncement.Start.TimeOfDay)
                        {
                            ShowNotification(new NotificationMessage
                            {
                                Severity = NotificationSeverity.Error,
                                Summary = "Error",
                                Detail = "Meeting end time must be after meeting start time.",
                                Duration = 3000
                            });
                        }
                        else
                        {
                            var response = await _client.PostAsJsonAsync($"{Path.Classrooms}/{_classroomId}/" +
                                                                         $"{Path.Announcements}", new Announcement()
                            {
                                Description = _newAnnouncement.Description,
                                Severity = _newAnnouncement.Severity.ToLower(),
                                MeetingDate = _newAnnouncement.Date.ToString("dd.MM.yyyy"),
                                MeetingStart = _newAnnouncement.Start.ToString("HH:mm"),
                                MeetingEnd = _newAnnouncement.End.ToString("HH:mm")
                            });
                            if (response.IsSuccessStatusCode)
                            {
                                var newAnnouncement = await response.Content.ReadFromJsonAsync<Announcement>();
                                if (newAnnouncement != null)
                                {
                                    newAnnouncement.LinkDisabled = newAnnouncement.MeetingId == null;
                                    if (newAnnouncement.Severity == "informative")
                                    {
                                        _informativeAnnouncements.Insert(0, newAnnouncement);
                                    }
                                    else
                                    {
                                        _importantAnnouncements.Insert(0, newAnnouncement);
                                    }
                                }

                                _addAnnouncementCollapsed = !_addAnnouncementCollapsed;
                                _newAnnouncement = new Requests.Announcement()
                                {
                                    Description = string.Empty,
                                    Severity = "Informative",
                                    Date = DateTime.MinValue,
                                    Start = DateTime.MinValue,
                                    End = DateTime.MinValue
                                };
                                StateHasChanged();
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
                                    var authorizationResponse = await _client.GetAsync(
                                        $"oauth?email={email}&scope=https://www.googleapis.com/auth/calendar" +
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
                    }
                }
            }
            else
            {
                var response = await _client.PostAsJsonAsync($"{Path.Classrooms}/{_classroomId}/" +
                                                             $"{Path.Announcements}", new Announcement()
                {
                    Description = _newAnnouncement.Description,
                    Severity = _newAnnouncement.Severity.ToLower(),
                    MeetingDate = null,
                    MeetingStart = null,
                    MeetingEnd = null
                });
                if (response.IsSuccessStatusCode)
                {
                    var newAnnouncement = await response.Content.ReadFromJsonAsync<Announcement>();
                    if (newAnnouncement != null)
                    {
                        newAnnouncement.LinkDisabled = newAnnouncement.MeetingId == null;
                        if (newAnnouncement.Severity == "informative")
                        {
                            _informativeAnnouncements.Insert(0, newAnnouncement);
                        }
                        else
                        {
                            _importantAnnouncements.Insert(0, newAnnouncement);
                        }
                    }

                    _addAnnouncementCollapsed = !_addAnnouncementCollapsed;
                    _newAnnouncement = new Requests.Announcement()
                    {
                        Description = string.Empty,
                        Severity = "Informative",
                        Date = DateTime.MinValue,
                        Start = DateTime.MinValue,
                        End = DateTime.MinValue
                    };
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

        private async Task DeleteSchedule(Guid id)
        {
            var response = await _client.DeleteAsync($"{Path.Classrooms}/{_classroomId}/{Path.Schedules}/{id}");
            if (response.IsSuccessStatusCode)
            {
                _schedules.Remove(_schedules.SingleOrDefault(schedule => schedule.Id == id));
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

        private async Task DeleteInformativeAnnouncement(Guid id)
        {
            var response = await _client.DeleteAsync($"{Path.Classrooms}/{_classroomId}/{Path.Announcements}/" +
                                                     $"{id}");
            if (response.IsSuccessStatusCode)
            {
                _informativeAnnouncements.Remove(_informativeAnnouncements.SingleOrDefault(announcement =>
                    announcement.Id == id));
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

        private async Task DeleteImportantAnnouncement(Guid id)
        {
            var response = await _client.DeleteAsync($"{Path.Classrooms}/{_classroomId}/" +
                                                     $"{Path.Announcements}/{id}");
            if (response.IsSuccessStatusCode)
            {
                _importantAnnouncements.Remove(_importantAnnouncements.SingleOrDefault(announcement =>
                    announcement.Id == id));
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