using DomainLayer.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class CouponUsage : EntityBase
    {
        public Guid CouponId { get; set; }
        public Coupon Coupon { get; set; } = null!;
        public Guid UserId { get; set; }
        public AppUser User { get; set; } = null!;
        public DateTime UsedAt { get; set; } = DateTime.UtcNow;
        public decimal DiscountAmount { get; set; }
        public int QuantityUsed { get; set; } // Kaç adet için kupon kullanıldı
        public Guid? OrderId { get; set; } // Hangi siparişte kullanıldı
        public Order? Order { get; set; }
    }
}
