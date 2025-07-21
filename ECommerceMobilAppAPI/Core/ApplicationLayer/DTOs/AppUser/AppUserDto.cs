using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.AppUser
{
    public class AppUserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } 
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<Guid> Orders { get; set; } = new();
    }
}
