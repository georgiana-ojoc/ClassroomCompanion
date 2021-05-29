using System;

namespace Client.Models
{
    public class Schedule
    {
        public Guid Id { get; set; }
        public Guid ClassroomId { get; set; }
        public string EventId { get; set; }

        public string EventLink { get; set; }
        public bool LinkDisabled { get; set; }
        public bool AddToCalendarDisabled { get; set; }
        public bool RemoveFromCalendarDisabled { get; set; }
        public string Day { get; set; }
        public string Start { get; set; }
        public string End { get; set; }
    }
}