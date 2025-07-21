using ApplicationLayer.DTOs.OrderItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.Order
{
    public class UpdateOrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public List<UpdateOrderItemDto> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
    }
}
