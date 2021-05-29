using System;

namespace Client.Requests
{
    public class Schedule
    {
        public string Day { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
}