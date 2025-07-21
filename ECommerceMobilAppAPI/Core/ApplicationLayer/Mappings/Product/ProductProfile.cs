using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Mappings.Product
{
    public class ProductProfile :Profile
    {
        public ProductProfile()
        {
            CreateMap<DomainLayer.Entities.Product, ApplicationLayer.DTOs.ProductDto>()
                .ReverseMap();
            CreateMap<DomainLayer.Entities.Product, ApplicationLayer.DTOs.UpdateProductDto>()
                .ReverseMap();
            CreateMap<DomainLayer.Entities.Product, ApplicationLayer.DTOs.CreateProductDto>()
                .ReverseMap();
        }
    }
}
