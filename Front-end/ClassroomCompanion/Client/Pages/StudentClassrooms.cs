using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Client.Models;
using Client.Utility;
using Radzen;

namespace Client.Pages
{
    public partial class StudentClassrooms
    {
        private bool _joinClassroomCollapsed = true;
        private string _newClassroomId = string.Empty;
        private IList<Classroom> _classrooms;

        protected override async Task OnInitializedAsync()
        {
            _classrooms = await _client.GetFromJsonAsync<IList<Classroom>>($"{Path.Classrooms}?role=student");
        }

        private async Task JoinClassroom()
        {
            try
            {
                Guid classroomId = Guid.Parse(_newClassroomId);
                var studentResponse = await _client.PostAsync($"{Path.Classrooms}/{classroomId}/" +
                                                              $"{Path.Students}", null!);
                if (studentResponse.IsSuccessStatusCode)
                {
                    var classroomResponse = await _client.GetAsync($"{Path.Classrooms}/{_newClassroomId}");
                    if (classroomResponse.IsSuccessStatusCode)
                    {
                        var newClassroom = await classroomResponse.Content.ReadFromJsonAsync<Classroom>();
                        _classrooms.Add(newClassroom);
                        _joinClassroomCollapsed = !_joinClassroomCollapsed;
                        _newClassroomId = string.Empty;
                        StateHasChanged();
                    }
                    else
                    {
                        var error = await studentResponse.Content.ReadFromJsonAsync<Error>();
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
                else
                {
                    var error = await studentResponse.Content.ReadFromJsonAsync<Error>();
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
            catch (ArgumentNullException)
            {
                ShowNotification(new NotificationMessage
                {
                    Severity = NotificationSeverity.Error,
                    Summary = "Error",
                    Detail = "Code cannot be empty.",
                    Duration = 3000
                });
            }
            catch (FormatException)
            {
                ShowNotification(new NotificationMessage
                {
                    Severity = NotificationSeverity.Error,
                    Summary = "Error",
                    Detail = "Code must be GUID.",
                    Duration = 3000
                });
            }
        }

        private async Task LeaveClassroom(Guid id)
        {
            var result = await _dialogService.Confirm("Are you sure?", "Leave classroom",
                new ConfirmOptions()
                {
                    OkButtonText = "Yes",
                    CancelButtonText = "No"
                });
            if (result.HasValue && result.Value)
            {
                var response = await _client.DeleteAsync($"{Path.Classrooms}/{id}/{Path.Students}");
                if (response.IsSuccessStatusCode)
                {
                    _classrooms.Remove(_classrooms.SingleOrDefault(classroom => classroom.Id == id));
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

        private async Task SetClassroomId(Guid id)
        {
            await _idService.SetStudentClassroomId(id);
            _navigationManager.NavigateTo("student_classroom");
        }

        private void ShowNotification(NotificationMessage message)
        {
            _notificationService.Notify(message);
        }
    }
}