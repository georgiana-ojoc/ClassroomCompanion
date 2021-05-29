using System;

namespace Client.Requests
{
    public class Announcement
    {
        public string Description { get; set; }
        public string Severity { get; set; }
        public DateTime Date { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}