using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.DTOs.Order;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Concrete
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly UserManager<AppUser> userManager;
        private readonly IMapper mapper;
        private readonly IOrderService orderService;

        public AdminService(IUnitOfWork unitOfWork,UserManager<AppUser> userManager,IMapper mapper, IOrderService orderService)
        {
            this.unitOfWork = unitOfWork;
            this.userManager = userManager;
            this.mapper = mapper;
            this.orderService = orderService;
        }

        public async Task<ServiceResponse<List<OrderListDto>>> GetAllOrdersWithUser()
        {
            var orderRepo= unitOfWork.GetRepository<Order>();
            var orders =await orderRepo.GetAllAsync();


            if( orders == null || !orders.Any())
            {
                return new ServiceResponse<List<OrderListDto>>("No orders found");
            }

            var result = mapper.Map<List<OrderListDto>>(orders);
            foreach (var order in result)
            {
                var user = await userManager.FindByIdAsync(order.UserId.ToString());
                var roles = await userManager.GetRolesAsync(user);
                var ordersOfUser= await orderRepo.GetAllAsync(o => o.UserId==user.Id);
                if (user != null)
                {
                    order.User = new AppUserWithRolesDto
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber,
                        Address = user.Address,
                        CreatedAt = user.CreatedAt,
                        Orders = ordersOfUser.Select(o => o.Id).ToList() ?? new List<Guid>(),
                        Roles = roles.ToList()
                    };
                }
            }
            return new ServiceResponse<List<OrderListDto>>(result);
        }

        public async Task<ServiceResponse<List<AppUserWithRolesDto>>> GetAllUsersWithRole()
        {
            var users = userManager.Users.ToList();
            var result = new List<AppUserWithRolesDto>();

            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                result.Add(new AppUserWithRolesDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Address = user.Address,
                    CreatedAt = user.CreatedAt,
                    Orders = user.Orders?.Select(o => o.Id).ToList() ?? new List<Guid>(),
                    Roles = roles.ToList()
                });
            }

            return new ServiceResponse<List<AppUserWithRolesDto>>(result);
        }

        public async Task<ServiceResponse<OrderListDto>> GetOrderByIdWithDetails(Guid id)
        {
            var order=await unitOfWork.GetRepository<Order>().GetAsync(o => o.Id == id, o => o.Items);
            if (order == null)
            {
                return new ServiceResponse<OrderListDto>("Order not found.");
            }
            var orderDto = mapper.Map<OrderListDto>(order);
            var user = await userManager.FindByIdAsync(order.UserId.ToString());
            if (user != null)
            {
                var roles = await userManager.GetRolesAsync(user);
                orderDto.User = new AppUserWithRolesDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Address = user.Address,
                    CreatedAt = user.CreatedAt,
                    Orders = user.Orders?.Select(o => o.Id).ToList() ?? new List<Guid>(),
                    Roles = roles.ToList()
                };
            }
            return new ServiceResponse<OrderListDto>(orderDto);
        }
    }
}
