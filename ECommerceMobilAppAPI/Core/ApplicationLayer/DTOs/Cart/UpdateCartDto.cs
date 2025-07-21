using ApplicationLayer.DTOs.CartItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.Cart
{
    public class UpdateCartDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
    }
}
