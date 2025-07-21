using DomainLayer.BaseEntity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class AppUser : IdentityUser<Guid>
    {
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<Order> Orders { get; set; }
        public ICollection<Cart> Carts { get; set; }
        public string FullName { get; set; } 

    }
}
