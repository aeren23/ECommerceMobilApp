using ApplicationLayer.DTOs.AppUser;
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
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public UserProfileController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        // Kullanıcının Guid Id'sini JWT'den alır
        private Guid GetUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(idStr))
                throw new UnauthorizedAccessException("User not authenticated or token missing NameIdentifier claim.");
            return Guid.Parse(idStr);
        }

        // Profil bilgilerini getir
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var result = await _userProfileService.GetProfileAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        // Profil bilgilerini güncelle
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] AppUserDto dto)
        {
            var userId = GetUserId();
            var result = await _userProfileService.UpdateProfileAsync(userId, dto);
            return result.Success ? Ok() : BadRequest(result);
        }

        // Profilini sil
        [HttpDelete]
        public async Task<IActionResult> DeleteProfile()
        {
            var userId = GetUserId();
            var result = await _userProfileService.DeleteProfileAsync(userId);
            return result.Success ? Ok() : BadRequest(result);
        }

        // Kullanıcıya rol ekle
        [HttpPost("add-role")]
        public async Task<IActionResult> AddRole([FromBody] string roleName)
        {
            var userId = GetUserId();
            var result = await _userProfileService.AddRoleToUserAsync(userId, roleName);
            return result.Success ? Ok() : BadRequest(result);
        }
    }
}