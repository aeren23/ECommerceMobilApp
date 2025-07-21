using ApplicationLayer.DTOs.Order;
using ApplicationLayer.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface IOrderService
    {
        Task<ServiceResponse<List<OrderDto>>> GetOrdersByUserIdAsync(Guid userId);
        Task<ServiceResponse<OrderDto>> GetOrderByIdAsync(Guid orderId);
        Task<ServiceResponse<Guid>> CreateOrderAsync(CreateOrderDto dto);
        Task<ServiceResponse<bool>> DeleteOrderAsync(Guid orderId);
    }
}
