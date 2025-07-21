using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Concrete
{
    public class UserProfileService : IUserProfileService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;
        private readonly RoleManager<AppRole> _roleManager;

        public UserProfileService(UserManager<AppUser> userManager, IMapper mapper, RoleManager<AppRole> roleManager)
        {
            _userManager = userManager;
            _mapper = mapper;
            _roleManager = roleManager;
        }

        public async Task<ServiceResponse<AppUserDto>> GetProfileAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return new ServiceResponse<AppUserDto>("User not found.");
            return new ServiceResponse<AppUserDto>(_mapper.Map<AppUserDto>(user));
        }

        public async Task<ServiceResponse<bool>> UpdateProfileAsync(Guid userId, AppUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return new ServiceResponse<bool>("User not found.");

            user.UserName = dto.Email;
            user.Email = dto.Email;
            user.Address = dto.Address;
            user.PhoneNumber = dto.PhoneNumber;
            user.FullName = dto.FullName;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return new ServiceResponse<bool>("Profile update failed.");
            return new ServiceResponse<bool>(true);
        }

        public async Task<ServiceResponse<bool>> DeleteProfileAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return new ServiceResponse<bool>("User not found.");
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return new ServiceResponse<bool>("Profile delete failed.");
            return new ServiceResponse<bool>(true);
        }

        public async Task<ServiceResponse<bool>> AddRoleToUserAsync(Guid userId, string roleName)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return new ServiceResponse<bool>("User not found.");
            if (!await _roleManager.RoleExistsAsync(roleName))
                await _roleManager.CreateAsync(new AppRole(roleName));
            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (!result.Succeeded)
                return new ServiceResponse<bool>("Role add failed.");
            return new ServiceResponse<bool>(true);
        }
    }
}