using ApplicationLayer.DTOs.Category;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.DTOs
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public Guid CategoryId { get; set; }
        public CategoryDto Category { get; set; } = null!;
        public string Image { get; set; } = null!;
        public decimal Price { get; set; }
        public string Seller { get; set; } = null!;
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; }
        public double Rating { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}
