using ApplicationLayer.DTOs.Coupon;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Seller")]
    public class CouponController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpPost]
        public async Task<ActionResult<ServiceResponse<CouponDto>>> CreateCoupon([FromBody] CreateCouponDto dto)
        {
            var result = await _couponService.CreateCouponAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("my-coupons")]
        public async Task<ActionResult<ServiceResponse<List<CouponDto>>>> GetMyCoupons()
        {
            var userId = GetUserId().ToString();
            var result = await _couponService.GetCouponsByCreatorAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut]
        public async Task<ActionResult<ServiceResponse<CouponDto>>> UpdateCoupon([FromBody] UpdateCouponDto dto)
        {
            var result = await _couponService.UpdateCouponAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteCoupon(Guid id)
        {
            var result = await _couponService.DeleteCouponAsync(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("validate")]
        [Authorize] 
        public async Task<ActionResult<ServiceResponse<CouponValidationResult>>> ValidateCoupon([FromBody] ValidateCouponRequest request)
        {
            var result = await _couponService.ValidateCouponAsync(
                request.CouponCode, 
                request.ProductId, 
                request.Quantity, 
                request.OriginalPrice
            );
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }

    // Request model'lar
    public class ValidateCouponRequest
    {
        public string CouponCode { get; set; } = null!;
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal OriginalPrice { get; set; }
    }
}