using ApplicationLayer.DTOs.Order;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApplicationLayer.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<OrderDto>>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orderRepo = _unitOfWork.GetRepository<Order>();
            var orders = await orderRepo.GetAllAsync(o => o.UserId == userId, o => o.Items);
            var dtos = _mapper.Map<List<OrderDto>>(orders);
            return new ServiceResponse<List<OrderDto>>(dtos);
        }

        public async Task<ServiceResponse<OrderDto>> GetOrderByIdAsync(Guid orderId)
        {
            var orderRepo = _unitOfWork.GetRepository<Order>();
            var order = await orderRepo.GetAsync(o => o.Id == orderId, o => o.Items);
            if (order == null)
                return new ServiceResponse<OrderDto>("Order not found.");


            var dto = _mapper.Map<OrderDto>(order);
            return new ServiceResponse<OrderDto>(dto);
        }

        public async Task<ServiceResponse<Guid>> CreateOrderAsync(CreateOrderDto dto)
        {
            var orderRepo = _unitOfWork.GetRepository<Order>();
            var productRepo = _unitOfWork.GetRepository<Product>();

            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var order = new Order
                    {
                        UserId = dto.UserId,
                        CreatedAt = DateTime.UtcNow,
                        Items = new List<OrderItem>()
                    };

                    var productQuantities = new Dictionary<Guid, int>();
                    foreach (var itemDto in dto.Items)
                    {
                        var product = await productRepo.GetByGuidAsync(itemDto.ProductId);
                        if (product == null)
                            return new ServiceResponse<Guid>($"Product not found: {itemDto.ProductId}");

                        productQuantities[itemDto.ProductId] = itemDto.Quantity;

                        order.Items.Add(new OrderItem
                        {
                            ProductId = itemDto.ProductId,
                            Quantity = itemDto.Quantity,
                            Price = itemDto.Price
                        });
                    }

                    // Önce tüm stokları kontrol et
                    foreach (var item in productQuantities)
                    {
                        var product = await productRepo.GetByGuidAsync(item.Key);
                        if (product == null)
                            return new ServiceResponse<Guid>($"Product not found: {item.Key}");
                        if (item.Value > product.Stock)
                            return new ServiceResponse<Guid>($"Insufficient stock for product: {item.Key}");
                    }

                    // Stokları güncelle
                    foreach (var item in productQuantities)
                    {
                        var product = await productRepo.GetByGuidAsync(item.Key);
                        product.Stock -= item.Value;
                        await productRepo.UpdateAsync(product);
                    }

                    order.TotalPrice = order.Items.Sum(i => i.Price * i.Quantity);

                    await orderRepo.AddAsync(order);
                    await _unitOfWork.SaveAsync();

                    await transaction.CommitAsync();
                    return new ServiceResponse<Guid>(order.Id);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new ServiceResponse<Guid>($"Order creation failed: {ex.Message}");
                }
            }
        }

        public async Task<ServiceResponse<bool>> DeleteOrderAsync(Guid orderId)
        {
            var orderRepo = _unitOfWork.GetRepository<Order>();
            var entity = await orderRepo.GetByGuidAsync(orderId);
            if (entity == null)
                return new ServiceResponse<bool>("Order not found.");
            await orderRepo.DeleteAsync(entity);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<bool>(true);
        }

        private void UpdateOrderTotalPrice(Order order)
        {
            order.TotalPrice = order.Items.Sum(i => i.Price * i.Quantity);
        }
    }
}