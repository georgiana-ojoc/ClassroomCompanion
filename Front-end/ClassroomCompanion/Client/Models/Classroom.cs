using System;

namespace Client.Models
{
    public class Classroom
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Subject { get; set; }
        public string Professor { get; set; }
        public string Names { get; set; }
    }
}