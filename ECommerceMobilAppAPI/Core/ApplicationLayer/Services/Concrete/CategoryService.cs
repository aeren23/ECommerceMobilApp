using ApplicationLayer.DTOs;
using ApplicationLayer.DTOs.Category;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;

namespace ApplicationLayer.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<CategoryDto>>> GetAllAsync()
        {
            var repo = _unitOfWork.GetRepository<Category>();
            var categories = await repo.GetAllAsync();
            var dtos = _mapper.Map<List<CategoryDto>>(categories);
            return new ServiceResponse<List<CategoryDto>>(dtos);
        }

        public async Task<ServiceResponse<CategoryDto>> GetByIdAsync(Guid id)
        {
            var repo = _unitOfWork.GetRepository<Category>();
            var category = await repo.GetByGuidAsync(id);
            if (category == null)
                return new ServiceResponse<CategoryDto>("Category not found.");
            var dto = _mapper.Map<CategoryDto>(category);
            return new ServiceResponse<CategoryDto>(dto);
        }

        public async Task<ServiceResponse<Guid>> CreateAsync(CreateCategoryDto dto)
        {
            var repo = _unitOfWork.GetRepository<Category>();
            var entity = _mapper.Map<Category>(dto);
            await repo.AddAsync(entity);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<Guid>(entity.Id);
        }

        public async Task<ServiceResponse<Guid>> UpdateAsync(UpdateCategoryDto dto)
        {
            var repo = _unitOfWork.GetRepository<Category>();
            var entity = await repo.GetByGuidAsync(dto.Id);
            if (entity == null)
                return new ServiceResponse<Guid>("Category not found.");
            entity.Name = dto.Name;
            await repo.UpdateAsync(entity);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<Guid>(entity.Id);
        }

        public async Task<ServiceResponse<bool>> DeleteAsync(Guid id)
        {
            var repo = _unitOfWork.GetRepository<Category>();
            var entity = await repo.GetByGuidAsync(id);
            if (entity == null)
                return new ServiceResponse<bool>("Category not found.");
            await repo.DeleteAsync(entity);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<bool>(true);
        }
    }
}