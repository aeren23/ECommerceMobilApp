using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using DomainLayer.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Concrete
{
    public class RoleService : IRoleService
    {
        private readonly RoleManager<AppRole> _roleManager;
        private readonly UserManager<AppUser> _userManager;

        public RoleService(RoleManager<AppRole> roleManager, UserManager<AppUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task<bool> CreateRoleAsync(string roleName)
        {
            if (await _roleManager.RoleExistsAsync(roleName))
                return false;
            var result = await _roleManager.CreateAsync(new AppRole(roleName));
            return result.Succeeded;
        }

        public async Task<bool> DeleteRoleAsync(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
                return false;
            var result = await _roleManager.DeleteAsync(role);
            return result.Succeeded;
        }

        public async Task<bool> UpdateRoleAsync(string oldRoleName, string newRoleName)
        {
            var role = await _roleManager.FindByNameAsync(oldRoleName);
            if (role == null)
                return false;
            role.Name = newRoleName;
            var result = await _roleManager.UpdateAsync(role);
            return result.Succeeded;
        }

        public async Task<IList<string>> GetRolesAsync()
        {
            return _roleManager.Roles.Select(r => r.Name).ToList();
        }

        public async Task<IList<string>> GetUserRolesAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
                return new List<string>();
            return await _userManager.GetRolesAsync(user);
        }
    }
}