using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.CartItem
{
    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid CartId { get; set; }
        public Guid ProductId { get; set; }
        public decimal Price { get; set; }
        public ProductDto Product { get; set; }
        public int Quantity { get; set; }
    }
}
