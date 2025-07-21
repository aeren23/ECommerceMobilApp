using ApplicationLayer.DTOs.Cart;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CartEntity=DomainLayer.Entities.Cart;

namespace ApplicationLayer.Mappings.Cart
{
    public class CartProfile :Profile
    {
        public CartProfile()
        {
            CreateMap<CartEntity, CartDto>().ReverseMap();
            CreateMap<CartEntity, CreateCartDto>().ReverseMap();
            CreateMap<CartEntity, UpdateCartDto>().ReverseMap();
        }
    }
}
