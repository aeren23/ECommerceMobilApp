// Core\DomainLayer\Entities\Coupon.cs
using DomainLayer.BaseEntity;
using System;
using System.Collections.Generic;

namespace DomainLayer.Entities
{
    public class Coupon : EntityBase
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public CouponType Type { get; set; }
        public decimal Value { get; set; } // Yüzde veya sabit tutar
        public decimal? MinimumAmount { get; set; } // Minimum sepet tutarı
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? UsageLimit { get; set; } // Toplam kullanım limiti
        public int? UsageLimitPerUser { get; set; } // Kullanıcı başına limit
        public int CurrentUsageCount { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public string CreatedBy { get; set; } = null!; // Admin veya Seller

        // İlişkiler
        public ICollection<CouponProduct> CouponProducts { get; set; } = new List<CouponProduct>();
        public ICollection<CouponUsage> UsageHistory { get; set; } = new List<CouponUsage>();
    }

    public enum CouponType
    {
        Percentage = 1, // Yüzde indirim
        FixedAmount = 2 // Sabit tutar indirim
    }
}