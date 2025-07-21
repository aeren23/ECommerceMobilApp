using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.DTOs.Order;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.Coupon
{
    public class CouponUsageDto
    {
        public Guid CouponId { get; set; }
        public CouponDto Coupon { get; set; } = null!;
        public Guid UserId { get; set; }
        public AppUserDto User { get; set; } = null!;
        public DateTime UsedAt { get; set; } = DateTime.UtcNow;
        public decimal DiscountAmount { get; set; }
        public int QuantityUsed { get; set; } // Kaç adet için kupon kullanıldı
        public Guid? OrderId { get; set; } // Hangi siparişte kullanıldı
        public OrderDto? Order { get; set; }
    }
}
