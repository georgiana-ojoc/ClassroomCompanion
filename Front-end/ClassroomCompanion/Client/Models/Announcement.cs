using System;

namespace Client.Models
{
    public class Announcement
    {
        public Guid Id { get; set; }
        public Guid ClassroomId { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; }
        public string MeetingId { get; set; }
        public string MeetingLink { get; set; }
        public string MeetingDate { get; set; }
        public string MeetingStart { get; set; }
        public string MeetingEnd { get; set; }
        public bool LinkDisabled { get; set; }
        public string Created { get; set; }
    }
}