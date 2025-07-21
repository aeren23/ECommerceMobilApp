using ApplicationLayer.DTOs.Category;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CategoryEntity= DomainLayer.Entities.Category;

namespace ApplicationLayer.Mappings.Category
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<CategoryEntity, CategoryDto>().ReverseMap();
            CreateMap<CreateCategoryDto, CategoryEntity>();
            CreateMap<UpdateCategoryDto, CategoryEntity>();
        }
    }
}
