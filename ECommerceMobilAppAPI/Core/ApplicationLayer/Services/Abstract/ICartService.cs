using ApplicationLayer.DTOs.Cart;
using ApplicationLayer.Wrappers;
using System;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface ICartService
    {
        Task<ServiceResponse<CartDto>> GetCartByUserIdAsync(Guid userId);
        Task<ServiceResponse<bool>> AddItemAsync(Guid userId, Guid productId, int quantity);
        Task<ServiceResponse<bool>> AddItemWithCouponAsync(Guid userId, Guid productId, int quantity, string couponCode);
        Task<ServiceResponse<bool>> RemoveItemAsync(Guid userId, Guid productId);
        Task<ServiceResponse<bool>> ClearCartAsync(Guid userId);
        Task<ServiceResponse<Guid>> CreateOrderFromCartAsync(Guid userId);
    }
}
