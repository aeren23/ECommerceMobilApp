using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ApplicationLayer.CQRS.Queries.ProductQueries
{
    public class GetProductsBySellerQuery : IRequest<ServiceResponse<List<ProductDto>>>
    {
        public string Seller { get; set; }

        public class Handler : IRequestHandler<GetProductsBySellerQuery, ServiceResponse<List<ProductDto>>>
        {
            private readonly IUnitOfWork _unitOfWork;
            private readonly IMapper _mapper;

            public Handler(IUnitOfWork unitOfWork, IMapper mapper)
            {
                _unitOfWork = unitOfWork;
                _mapper = mapper;
            }

            public async Task<ServiceResponse<List<ProductDto>>> Handle(GetProductsBySellerQuery request, CancellationToken cancellationToken)
            {
                var repo = _unitOfWork.GetRepository<Product>();
                var entities = await repo.GetAllAsync(p => p.Seller == request.Seller, p => p.Category);
                var dtos = _mapper.Map<List<ProductDto>>(entities);
                return new ServiceResponse<List<ProductDto>>(dtos);
            }
        }
    }
}