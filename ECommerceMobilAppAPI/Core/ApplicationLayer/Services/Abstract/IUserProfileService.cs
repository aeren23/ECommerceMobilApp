using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface IUserProfileService
    {
        Task<ServiceResponse<AppUserDto>> GetProfileAsync(Guid userId);
        Task<ServiceResponse<bool>> UpdateProfileAsync(Guid userId, AppUserDto dto);
        Task<ServiceResponse<bool>> DeleteProfileAsync(Guid userId);
        Task<ServiceResponse<bool>> AddRoleToUserAsync(Guid userId, string roleName);
    }
}
