using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Mappings.OrderItem
{
    public class OrderItemProfile:Profile
    {
        public OrderItemProfile()
        {
            CreateMap<DomainLayer.Entities.OrderItem, ApplicationLayer.DTOs.OrderItem.OrderItemDto>()
                .ReverseMap();
            CreateMap<DomainLayer.Entities.OrderItem, ApplicationLayer.DTOs.OrderItem.CreateOrderItemDto>()
                .ReverseMap();
            CreateMap<DomainLayer.Entities.OrderItem, ApplicationLayer.DTOs.OrderItem.UpdateOrderItemDto>()
                .ReverseMap();
        }
    }
}
