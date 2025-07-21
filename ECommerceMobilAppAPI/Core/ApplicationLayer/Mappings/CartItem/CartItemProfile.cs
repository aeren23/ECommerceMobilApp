using ApplicationLayer.DTOs.CartItem;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Mappings.CartItem
{
    public class CartItemProfile :Profile
    {
        public CartItemProfile()
        {
            CreateMap<DomainLayer.Entities.CartItem, CartItemDto>().ReverseMap();
            CreateMap<DomainLayer.Entities.CartItem, CreateCartItemDto>().ReverseMap();
            CreateMap<DomainLayer.Entities.CartItem, UpdateCartItemDto>().ReverseMap();
        }
    }
}
