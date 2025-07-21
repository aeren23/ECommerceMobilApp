using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using MediatR;


namespace ApplicationLayer.CQRS.Commands.ProductCmmands
{
    public class CreateProductCommand : IRequest<ServiceResponse<Guid>>
    {
        public CreateProductDto Product { get; set; } = null!;

        public class Handler : IRequestHandler<CreateProductCommand, ServiceResponse<Guid>>
        {
            private readonly IUnitOfWork _unitOfWork;
            private readonly IMapper _mapper;

            public Handler(IUnitOfWork unitOfWork, IMapper mapper)
            {
                _unitOfWork = unitOfWork;
                _mapper = mapper;
            }

            public async Task<ServiceResponse<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
            {
                try
                {
                    var entity = _mapper.Map<Product>(request.Product);
                    await _unitOfWork.GetRepository<Product>().AddAsync(entity);
                    await _unitOfWork.SaveAsync();
                    return new ServiceResponse<Guid>(entity.Id);
                }
                catch (Exception ex)
                {
                    return new ServiceResponse<Guid>($"Error creating product: {ex.Message}");
                }
            }
        }
    }
}