using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using MediatR;


namespace ApplicationLayer.CQRS.Queries.ProductQueries
{
    public class GetProductByIdQuery : IRequest<ServiceResponse<ProductDto>>
    {
        public Guid Id { get; set; }

        public class Handler : IRequestHandler<GetProductByIdQuery, ServiceResponse<ProductDto>>
        {
            private readonly IUnitOfWork _unitOfWork;
            private readonly IMapper _mapper;

            public Handler(IUnitOfWork unitOfWork, IMapper mapper)
            {
                _unitOfWork = unitOfWork;
                _mapper = mapper;
            }

            public async Task<ServiceResponse<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
            {
                var repo = _unitOfWork.GetRepository<Product>();
                var entity = await repo.GetAsync(x=>x.Id==request.Id,c=>c.Category);
                if (entity == null)
                    return new ServiceResponse<ProductDto>("Product not found.");

                var dto = _mapper.Map<ProductDto>(entity);
                return new ServiceResponse<ProductDto>(dto);
            }
        }
    }
}