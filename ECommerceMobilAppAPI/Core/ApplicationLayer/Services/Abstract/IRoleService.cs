using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface IRoleService
    {
        Task<bool> CreateRoleAsync(string roleName);
        Task<bool> DeleteRoleAsync(string roleName);
        Task<bool> UpdateRoleAsync(string oldRoleName, string newRoleName);
        Task<IList<string>> GetRolesAsync();
        Task<IList<string>> GetUserRolesAsync(Guid userId);
    }
}
