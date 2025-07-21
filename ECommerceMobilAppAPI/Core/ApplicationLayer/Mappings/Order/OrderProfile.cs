using ApplicationLayer.DTOs.Order;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OrderEntity = DomainLayer.Entities.Order;

namespace ApplicationLayer.Mappings.Order
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<OrderEntity, OrderDto>().ReverseMap();
            CreateMap<OrderEntity, CreateOrderDto>().ReverseMap();
            CreateMap<OrderEntity, UpdateOrderDto>().ReverseMap();
            CreateMap<OrderEntity, OrderListDto>().ReverseMap();
        }
    }
}
