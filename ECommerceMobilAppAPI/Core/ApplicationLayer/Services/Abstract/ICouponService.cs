using ApplicationLayer.DTOs.Coupon;
using ApplicationLayer.Wrappers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface ICouponService
    {
        Task<ServiceResponse<CouponDto>> CreateCouponAsync(CreateCouponDto dto);
        Task<ServiceResponse<List<CouponDto>>> GetCouponsByCreatorAsync(string creatorId);
        Task<ServiceResponse<CouponValidationResult>> ValidateCouponAsync(string couponCode, Guid productId, int quantity, decimal originalPrice);
        Task<ServiceResponse<bool>> DeleteCouponAsync(Guid couponId);
        Task<ServiceResponse<CouponDto>> UpdateCouponAsync(UpdateCouponDto dto);
        Task<ServiceResponse<bool>> RecordCouponUsageAsync(Guid couponId, Guid userId, int quantityUsed, decimal discountAmount, Guid orderId);
    }

    public class CouponValidationResult
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public CouponDto? Coupon { get; set; }
    }
}