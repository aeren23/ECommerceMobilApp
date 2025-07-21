using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Models;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using Microsoft.AspNetCore.Identity;

namespace ApplicationLayer.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;
        private readonly JwtTokenGenerator jwtTokenGenerator;

        public AuthService(UserManager<AppUser> userManager, IMapper mapper, JwtTokenGenerator jwtTokenGenerator)
        {
            _userManager = userManager;
            _mapper = mapper;
            this.jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<ServiceResponse<Guid>> RegisterAsync(RegisterUserDto dto)
        {
            var user = new AppUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Customer"); // Default role
                return new ServiceResponse<Guid>(user.Id);
            }

            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return new ServiceResponse<Guid>($"Registration failed: {errors}");
        }

        public async Task<ServiceResponse<LoginApiModel>> LoginAsync(LoginUserDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return new ServiceResponse<LoginApiModel>("User not found.");

            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!passwordValid)
                return new ServiceResponse<LoginApiModel>("Invalid credentials.");

            var roles= await _userManager.GetRolesAsync(user);
            var token = jwtTokenGenerator.GenerateToken(user, roles);

            var userDto = _mapper.Map<AppUserDto>(user); //Mapper profile ekle !
            
            LoginApiModel loginApiModel = new LoginApiModel
            {
                User = userDto,
                Token = token
            };

            return new ServiceResponse<LoginApiModel>(loginApiModel);
        }
    }
}