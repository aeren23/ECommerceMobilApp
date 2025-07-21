using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        // Sadece "Customer" rolündeki kullanıcılar erişebilir
        [HttpGet("customer-only")]
        [Authorize]
        public IActionResult CustomerOnlyEndpoint()
        {
            return Ok("Customer rolündesin, bu endpoint'e erişimin var.");
        }

        [HttpGet("authenticated")]
        [Authorize(Roles ="Customer")]
        public IActionResult AuthenticatedEndpoint()
        {
            return Ok(new
            {
                Message = "Authentication çalışıyor!",
                User = User.Identity.Name,
                IsAuthenticated = User.Identity.IsAuthenticated
            });
        }
        [HttpGet("role-debug")]
        [Authorize]
        public IActionResult RoleDebugEndpoint()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

            return Ok(new
            {
                Claims = claims,
                Roles = roles,
                IsInRoleCustomer = User.IsInRole("Customer"),
                Identity = User.Identity.Name,
                IsAuthenticated = User.Identity.IsAuthenticated
            });
        }
        // Herkes erişebilir (authenticated olmasa da)
        [HttpGet("public")]
        [AllowAnonymous]
        public IActionResult PublicEndpoint()
        {
            return Ok("Burası herkese açık.");
        }
    }
}
