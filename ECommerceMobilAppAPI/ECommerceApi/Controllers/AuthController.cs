using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services;
using ApplicationLayer.Services.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IAuthService _authService;
        private readonly JwtTokenGenerator _jwtTokenGenerator;

        public AuthController(IAuthService authService,JwtTokenGenerator jwtTokenGenerator, IRoleService roleService)
        {
            _authService = authService;
            _jwtTokenGenerator = jwtTokenGenerator;
            _roleService = roleService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (result.Success)
                return Ok(result);
            return BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(result);


            return Ok(new
            {
                result
            });
        }
    }
}
