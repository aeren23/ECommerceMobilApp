using ApplicationLayer.DTOs.Order;
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
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var userId = GetUserId();
            var result = await _orderService.GetOrdersByUserIdAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(Guid orderId)
        {
            var result = await _orderService.GetOrderByIdAsync(orderId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            dto.UserId = GetUserId();
            var result = await _orderService.CreateOrderAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{orderId}")]
        public async Task<IActionResult> DeleteOrder(Guid orderId)
        {
            var result = await _orderService.DeleteOrderAsync(orderId);
            return result.Success ? Ok() : NotFound(result);
        }
    }
}