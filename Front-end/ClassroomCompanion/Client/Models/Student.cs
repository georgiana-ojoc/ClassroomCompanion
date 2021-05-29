using System;

namespace Client.Models
{
    public class Student
    {
        public Guid Id { get; set; }
        public Guid ClassroomId { get; set; }
        public string Email { get; set; }
        public string Names { get; set; }
    }
}