using ApplicationLayer.Interfaces;
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
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        // Kullanıcının wishlist'ini getir (sadece ürün Id'leri)
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetUserId();
            var result = await _wishlistService.GetWishlistAsync(userId);
            return Ok(result);
        }

        // Wishlist'e ürün ekle
        [HttpPost("add/{productId}")]
        public async Task<IActionResult> AddToWishlist(Guid productId)
        {
            var userId = GetUserId();
            await _wishlistService.AddToWishlistAsync(userId, productId);
            return Ok();
        }

        // Wishlist'ten ürün çıkar
        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromWishlist(Guid productId)
        {
            var userId = GetUserId();
            await _wishlistService.RemoveFromWishlistAsync(userId, productId);
            return Ok();
        }

        // Wishlist'i tamamen temizle
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearWishlist()
        {
            var userId = GetUserId();
            await _wishlistService.ClearWishlistAsync(userId);
            return Ok();
        }
    }
}