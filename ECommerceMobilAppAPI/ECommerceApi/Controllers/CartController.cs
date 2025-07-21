using ApplicationLayer.DTOs.Cart;
using ApplicationLayer.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            var result = await _cartService.GetCartByUserIdAsync(userId);
            return result.Success ? Ok(result.Value) : NotFound(result.ErrorMessage);
        }

        // Kuponsuz ürün ekleme
        [HttpPost("add-item")]
        public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
        {
            var userId = GetUserId();
            var result = await _cartService.AddItemAsync(userId, request.ProductId, request.Quantity);
            return result.Success ? Ok() : BadRequest(result.ErrorMessage);
        }

        // Kuponlu ürün ekleme
        [HttpPost("add-item-with-coupon")]
        public async Task<IActionResult> AddItemWithCoupon([FromBody] AddCartItemWithCouponRequest request)
        {
            var userId = GetUserId();
            var result = await _cartService.AddItemWithCouponAsync(userId, request.ProductId, request.Quantity, request.CouponCode);
            return result.Success ? Ok() : BadRequest(result.ErrorMessage);
        }

        // Sepetten sipariş oluştur
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrderFromCart()
        {
            var userId = GetUserId();
            var result = await _cartService.CreateOrderFromCartAsync(userId);
            return result.Success ? Ok(new { OrderId = result.Value }) : BadRequest(result.ErrorMessage);
        }

        [HttpDelete("remove-item/{productId}")]
        public async Task<IActionResult> RemoveItem(Guid productId)
        {
            var userId = GetUserId();
            var result = await _cartService.RemoveItemAsync(userId, productId);
            return result.Success ? Ok() : BadRequest(result.ErrorMessage);
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            var result = await _cartService.ClearCartAsync(userId);
            return result.Success ? Ok() : BadRequest(result.ErrorMessage);
        }
    }

    public class AddCartItemRequest
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class AddCartItemWithCouponRequest
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public string CouponCode { get; set; } = null!;
    }
}