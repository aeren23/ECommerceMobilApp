using ApplicationLayer.DTOs.OrderItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs.Order
{
    public class CreateOrderDto
    {
        public Guid UserId { get; set; }
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }
}
