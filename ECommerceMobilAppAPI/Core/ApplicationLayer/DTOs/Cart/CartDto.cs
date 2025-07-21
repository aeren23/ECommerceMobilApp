using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.DTOs.CartItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.Cart
{
    public class CartDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public decimal TotalPrice { get; set; }
        public AppUserDto? User { get; set; } 
        public List<CartItemDto> Items { get; set; } = new();
    }
}
