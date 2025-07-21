using ApplicationLayer.DTOs.Category;
using ApplicationLayer.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface ICategoryService
    {
        Task<ServiceResponse<List<CategoryDto>>> GetAllAsync();
        Task<ServiceResponse<CategoryDto>> GetByIdAsync(Guid id);
        Task<ServiceResponse<Guid>> CreateAsync(CreateCategoryDto dto);
        Task<ServiceResponse<Guid>> UpdateAsync(UpdateCategoryDto dto);
        Task<ServiceResponse<bool>> DeleteAsync(Guid id);
    }
}
