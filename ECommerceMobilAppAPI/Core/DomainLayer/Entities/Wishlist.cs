using DomainLayer.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class Wishlist: EntityBase
    {
        public Guid UserId { get; set; }
        public AppUser User { get; set; }
        public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
    }
}
