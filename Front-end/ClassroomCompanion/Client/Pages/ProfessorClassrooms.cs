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
    public partial class ProfessorClassrooms
    {
        private bool _createClassroomCollapsed = true;
        private Classroom _newClassroom = new();
        private IList<Classroom> _classrooms;

        protected override async Task OnInitializedAsync()
        {
            _classrooms = await _client.GetFromJsonAsync<IList<Classroom>>($"{Path.Classrooms}?role=professor");
        }

        private async Task CreateClassroom()
        {
            var response = await _client.PostAsJsonAsync($"{Path.Classrooms}", _newClassroom);
            if (response.IsSuccessStatusCode)
            {
                var newClassroom = await response.Content.ReadFromJsonAsync<Classroom>();
                _classrooms.Add(newClassroom);
                _createClassroomCollapsed = !_createClassroomCollapsed;
                _newClassroom = new Classroom();
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

        private async Task DeleteClassroom(Guid id)
        {
            var result = await _dialogService.Confirm("Are you sure?", "Delete classroom",
                new ConfirmOptions()
                {
                    OkButtonText = "Yes",
                    CancelButtonText = "No"
                });
            if (result.HasValue && result.Value)
            {
                var response = await _client.DeleteAsync($"{Path.Classrooms}/{id}");
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
            await _idService.SetProfessorClassroomId(id);
            _navigationManager.NavigateTo("professor_classroom");
        }

        private void ShowNotification(NotificationMessage message)
        {
            _notificationService.Notify(message);
        }
    }
}