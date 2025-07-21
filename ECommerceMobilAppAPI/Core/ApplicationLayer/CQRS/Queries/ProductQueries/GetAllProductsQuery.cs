using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using MediatR;

namespace ApplicationLayer.CQRS.Queries.ProductQueries
{
    public class GetAllProductsQuery : IRequest<ServiceResponse<List<ProductDto>>>
    {
        public class Handler : IRequestHandler<GetAllProductsQuery, ServiceResponse<List<ProductDto>>>
        {
            private readonly IUnitOfWork _unitOfWork;
            private readonly IMapper _mapper;

            public Handler(IUnitOfWork unitOfWork, IMapper mapper)
            {
                _unitOfWork = unitOfWork;
                _mapper = mapper;
            }

            public async Task<ServiceResponse<List<ProductDto>>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
            {
                var repo = _unitOfWork.GetRepository<Product>();
                var entities = await repo.GetAllAsync(null,c=>c.Category);
                var dtos = _mapper.Map<List<ProductDto>>(entities);
                return new ServiceResponse<List<ProductDto>>(dtos);
            }
        }
    }
}