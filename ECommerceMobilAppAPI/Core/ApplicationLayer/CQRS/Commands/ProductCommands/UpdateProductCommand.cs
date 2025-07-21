using ApplicationLayer.DTOs;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using MediatR;


namespace ApplicationLayer.CQRS.Commands.ProductCommands
{
    public class UpdateProductCommand : IRequest<ServiceResponse<Guid>>
    {
        public UpdateProductDto Product { get; set; } = null!;

        public class Handler : IRequestHandler<UpdateProductCommand, ServiceResponse<Guid>>
        {
            private readonly IUnitOfWork _unitOfWork;
            private readonly IMapper _mapper;

            public Handler(IUnitOfWork unitOfWork, IMapper mapper)
            {
                _unitOfWork = unitOfWork;
                _mapper = mapper;
            }

            public async Task<ServiceResponse<Guid>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
            {
                try
                {
                    var repo = _unitOfWork.GetRepository<Product>();
                    var entity = await repo.GetByGuidAsync(request.Product.Id);
                    if (entity == null)
                        return new ServiceResponse<Guid>("Product not found.");

                    _mapper.Map(request.Product, entity);
                    await repo.UpdateAsync(entity);
                    await _unitOfWork.SaveAsync();
                    return new ServiceResponse<Guid>(entity.Id);
                }
                catch (Exception ex)
                {
                    return new ServiceResponse<Guid>($"Error updating product: {ex.Message}");
                }
            }
        }
    }
}