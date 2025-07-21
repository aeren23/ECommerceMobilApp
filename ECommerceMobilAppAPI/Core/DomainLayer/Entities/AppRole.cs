using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class AppRole : IdentityRole<Guid>
    {
        public AppRole() : base() { }
        public AppRole(string roleName) : base(roleName)
        {
            Name = roleName;
        }
        public AppRole(Guid id, string roleName) : base(roleName)
        {
            Id = id;
            Name = roleName;
        }
    }
}
