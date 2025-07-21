using DomainLayer.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class Order :EntityBase
    {
        public Guid UserId { get; set; }
        public List<OrderItem> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public AppUser User { get; set; }
        public ICollection<CouponUsage> UsageHistory { get; set; } = new List<CouponUsage>();
    }
}

