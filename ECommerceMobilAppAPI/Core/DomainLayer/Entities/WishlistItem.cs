using DomainLayer.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class WishlistItem : EntityBase
    {
        public Guid WishlistId { get; set; }
        public Wishlist Wishlist { get; set; }
        public Guid ProductId { get; set; }
        public Product Product { get; set; } 
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
