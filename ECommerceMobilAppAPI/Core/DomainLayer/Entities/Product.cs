using DomainLayer.BaseEntity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayer.Entities
{
    public class Product : EntityBase
    {
        public string Name { get; set; } = null!;
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public string Image { get; set; } = null!;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string Seller { get; set; } = "Default Seller";
        public int Stock { get; set; }
        public double Rating { get; set; }
        public List<string> Tags { get; set; } = new();
        public ICollection<CartItem> CartItems { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }
        public ICollection<CouponProduct> CouponProducts { get; set; } = new List<CouponProduct>();

    }
}
