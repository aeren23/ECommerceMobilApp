using ApplicationLayer.Interfaces;
using ApplicationLayer.Wrappers;
using DomainLayer.Entities;
using MediatR;

namespace ApplicationLayer.CQRS.Commands.ProductCommands
{
    public class DeleteProductCommand : IRequest<ServiceResponse<Guid>>
    {
        public Guid Id { get; set; }

        public class Handler : IRequestHandler<DeleteProductCommand, ServiceResponse<Guid>>
        {
            private readonly IUnitOfWork _unitOfWork;

            public Handler(IUnitOfWork unitOfWork)
            {
                _unitOfWork = unitOfWork;
            }

            public async Task<ServiceResponse<Guid>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
            {
                try
                {
                    var repo = _unitOfWork.GetRepository<Product>();
                    var entity = await repo.GetByGuidAsync(request.Id);
                    if (entity == null)
                        return new ServiceResponse<Guid>("Product not found.");

                    await repo.DeleteAsync(entity);
                    await _unitOfWork.SaveAsync();
                    return new ServiceResponse<Guid>(request.Id);
                }
                catch (Exception ex)
                {
                    return new ServiceResponse<Guid>($"Error deleting product: {ex.Message}");
                }
            }
        }
    }
}