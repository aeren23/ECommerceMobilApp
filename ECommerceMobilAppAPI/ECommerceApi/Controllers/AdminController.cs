using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.DTOs.Order;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IOrderService _orderService;

        public AdminController(IAdminService adminService,IOrderService orderService)
        {
            _adminService = adminService;
            _orderService = orderService;
        }

        // Tüm kullanıcıları rollerle birlikte getir
        [HttpGet("users-with-roles")]
        public async Task<ActionResult<ServiceResponse<List<AppUserWithRolesDto>>>> GetAllUsersWithRoles()
        {
            var result = await _adminService.GetAllUsersWithRole();
            return result.Success ? Ok(result) : NotFound(result);
        }

        // Tüm siparişleri kullanıcı bilgisiyle getir
        [HttpGet("orders-with-users")]
        public async Task<ActionResult<ServiceResponse<List<OrderListDto>>>> GetAllOrdersWithUser()
        {
            var result = await _adminService.GetAllOrdersWithUser();
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("orders-details/{id}")]
        public async Task<ActionResult<ServiceResponse<OrderDto>>> GetOrderDetailsByIdForAdmin(Guid id)
        {
            var result = await _orderService.GetOrderByIdAsync(id);
            return (result==null || result.Success) ? Ok(result) : NotFound(result);
        }
    }
}