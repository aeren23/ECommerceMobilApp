using ApplicationLayer.DTOs.Coupon;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Concrete
{
    public class CouponService : ICouponService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CouponService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        //public async Task<ServiceResponse<>>

        public async Task<ServiceResponse<CouponDto>> CreateCouponAsync(CreateCouponDto dto)
        {
            var couponRepo = _unitOfWork.GetRepository<Coupon>();
            var couponProductRepo = _unitOfWork.GetRepository<CouponProduct>();

            // Kupon kodu kontrol
            var existingCoupon = await couponRepo.GetSingleOrDefaultAsync(c => c.Code == dto.Code);
            if (existingCoupon != null)
                return new ServiceResponse<CouponDto>("Coupon code already exists.");

            var coupon = new Coupon
            {
                Code = dto.Code,
                Name = dto.Name,
                Description = dto.Description,
                Type = (CouponType)dto.Type,
                Value = dto.Value,
                MinimumAmount = dto.MinimumAmount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit,
                UsageLimitPerUser = dto.UsageLimitPerUser,
                IsActive = true,
                CurrentUsageCount = 0,
                CreatedBy = dto.CreatedBy
            };

            await couponRepo.AddAsync(coupon);
            await _unitOfWork.SaveAsync();

            // Ürün iliþkisi
            var couponProduct = new CouponProduct
            {
                CouponId = coupon.Id,
                ProductId = dto.ProductId
            };
            await couponProductRepo.AddAsync(couponProduct);
            await _unitOfWork.SaveAsync();

            var result = _mapper.Map<CouponDto>(coupon);
            result.ProductId = dto.ProductId;
            return new ServiceResponse<CouponDto>(result);
        }

        public async Task<ServiceResponse<List<CouponDto>>> GetCouponsByCreatorAsync(string creatorId)
        {
            var couponRepo = _unitOfWork.GetRepository<Coupon>();
            var coupons = await couponRepo.GetAllAsync(c => c.CreatedBy == creatorId, c => c.CouponProducts);
            
            var result = new List<CouponDto>();
            foreach (var coupon in coupons)
            {
                var dto = _mapper.Map<CouponDto>(coupon);
                dto.ProductId = coupon.CouponProducts.FirstOrDefault()?.ProductId ?? Guid.Empty;
                result.Add(dto);
            }

            return new ServiceResponse<List<CouponDto>>(result);
        }

        public async Task<ServiceResponse<CouponValidationResult>> ValidateCouponAsync(string couponCode, Guid productId, int quantity, decimal originalPrice)
        {
            var couponRepo = _unitOfWork.GetRepository<Coupon>();
            var coupon = await couponRepo.GetSingleOrDefaultAsync(c => c.Code == couponCode, c => c.CouponProducts);
            
            if (coupon == null)
                return new ServiceResponse<CouponValidationResult>(new CouponValidationResult { IsValid = false, Message = "Coupon not found." });

            if (!coupon.IsActive)
                return new ServiceResponse<CouponValidationResult>(new CouponValidationResult { IsValid = false, Message = "Coupon is not active." });

            var now = DateTime.UtcNow;
            if (now < coupon.StartDate || now > coupon.EndDate)
                return new ServiceResponse<CouponValidationResult>(new CouponValidationResult { IsValid = false, Message = "Coupon is expired." });

            // Kullaným limiti kontrolü - quantity ile birlikte
            if (coupon.UsageLimit.HasValue && (coupon.CurrentUsageCount + quantity) > coupon.UsageLimit.Value)
                return new ServiceResponse<CouponValidationResult>(new CouponValidationResult { IsValid = false, Message = $"Coupon usage limit exceeded. Remaining: {coupon.UsageLimit.Value - coupon.CurrentUsageCount}" });

            var isProductApplicable = coupon.CouponProducts.Any(cp => cp.ProductId == productId);
            if (!isProductApplicable)
                return new ServiceResponse<CouponValidationResult>(new CouponValidationResult { IsValid = false, Message = "Coupon not applicable to this product." });

            var totalAmount = originalPrice * quantity;
            if (coupon.MinimumAmount.HasValue && totalAmount < coupon.MinimumAmount.Value)
                return new ServiceResponse<CouponValidationResult>(new CouponValidationResult { IsValid = false, Message = $"Minimum amount required: {coupon.MinimumAmount.Value:C}" });

            decimal discountAmount = 0;
            if (coupon.Type == CouponType.Percentage)
                discountAmount = (totalAmount * coupon.Value) / 100;
            else if (coupon.Type == CouponType.FixedAmount)
                discountAmount = coupon.Value*quantity;

            var finalPrice = Math.Max(0, totalAmount - discountAmount);

            var couponDto = _mapper.Map<CouponDto>(coupon);
            couponDto.ProductId = productId;

            return new ServiceResponse<CouponValidationResult>(new CouponValidationResult
            {
                IsValid = true,
                Message = "Coupon is valid.",
                DiscountAmount = discountAmount,
                FinalPrice = finalPrice,
                Coupon = couponDto
            });
        }

        public async Task<ServiceResponse<bool>> DeleteCouponAsync(Guid couponId)
        {
            var couponRepo = _unitOfWork.GetRepository<Coupon>();
            var coupon = await couponRepo.GetByGuidAsync(couponId);
            
            if (coupon == null)
                return new ServiceResponse<bool>("Coupon not found.");

            await couponRepo.DeleteAsync(coupon);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<bool>(true);
        }

        public async Task<ServiceResponse<CouponDto>> UpdateCouponAsync(UpdateCouponDto dto)
        {
            var couponRepo = _unitOfWork.GetRepository<Coupon>();
            var couponProductRepo = _unitOfWork.GetRepository<CouponProduct>();

            var coupon = await couponRepo.GetAsync(c => c.Id == dto.Id, c => c.CouponProducts);
            if (coupon == null)
                return new ServiceResponse<CouponDto>("Coupon not found.");

            coupon.Code = dto.Code;
            coupon.Name = dto.Name;
            coupon.Description = dto.Description;
            coupon.Type = (CouponType)dto.Type;
            coupon.Value = dto.Value;
            coupon.MinimumAmount = dto.MinimumAmount;
            coupon.StartDate = dto.StartDate;
            coupon.EndDate = dto.EndDate;
            coupon.UsageLimit = dto.UsageLimit;
            coupon.UsageLimitPerUser = dto.UsageLimitPerUser;
            coupon.IsActive = dto.IsActive;

            // Ürün iliþkisini güncelle
            var existingProduct = coupon.CouponProducts.FirstOrDefault();
            if (existingProduct != null)
            {
                await couponProductRepo.DeleteAsync(existingProduct);
            }

            var newCouponProduct = new CouponProduct
            {
                CouponId = coupon.Id,
                ProductId = dto.ProductId
            };
            await couponProductRepo.AddAsync(newCouponProduct);

            await couponRepo.UpdateAsync(coupon);
            await _unitOfWork.SaveAsync();

            var result = _mapper.Map<CouponDto>(coupon);
            result.ProductId = dto.ProductId;
            return new ServiceResponse<CouponDto>(result);
        }

        // Sipariþ oluþturulduðunda kupon kullanýmýný kaydet
        public async Task<ServiceResponse<bool>> RecordCouponUsageAsync(Guid couponId, Guid userId, int quantityUsed, decimal discountAmount, Guid orderId)
        {
            var couponRepo = _unitOfWork.GetRepository<Coupon>();
            var couponUsageRepo = _unitOfWork.GetRepository<CouponUsage>();

            var coupon = await couponRepo.GetByGuidAsync(couponId);
            if (coupon == null)
                return new ServiceResponse<bool>("Coupon not found.");

            // Kupon kullaným kaydý oluþtur
            var couponUsage = new CouponUsage
            {
                CouponId = couponId,
                UserId = userId,
                QuantityUsed = quantityUsed,
                DiscountAmount = discountAmount,
                OrderId = orderId,
                UsedAt = DateTime.UtcNow
            };

            await couponUsageRepo.AddAsync(couponUsage);

            // Kupon kullaným sayacýný güncelle
            coupon.CurrentUsageCount += quantityUsed;
            await couponRepo.UpdateAsync(coupon);

            await _unitOfWork.SaveAsync();
            return new ServiceResponse<bool>(true);
        }
    }
}