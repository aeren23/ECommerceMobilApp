using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.DTOs.Order;
using ApplicationLayer.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface IAdminService
    {
        Task<ServiceResponse<List<AppUserWithRolesDto>>> GetAllUsersWithRole ();
        Task<ServiceResponse<List<OrderListDto>>> GetAllOrdersWithUser();
        Task<ServiceResponse<OrderListDto>> GetOrderByIdWithDetails(Guid id);
    }
}
