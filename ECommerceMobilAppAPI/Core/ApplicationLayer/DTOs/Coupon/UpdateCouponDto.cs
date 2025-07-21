using System;

namespace ApplicationLayer.DTOs.Coupon
{
    public class UpdateCouponDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public int Type { get; set; }
        public decimal Value { get; set; }
        public decimal? MinimumAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? UsageLimit { get; set; }
        public int? UsageLimitPerUser { get; set; }
        public bool IsActive { get; set; }
        public Guid ProductId { get; set; } 
    }
}