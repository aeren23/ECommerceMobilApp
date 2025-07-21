using ApplicationLayer.CQRS.Commands.ProductCommands;
using ApplicationLayer.CQRS.Commands.ProductCmmands;
using ApplicationLayer.CQRS.Commands.ProductCommands;
using ApplicationLayer.CQRS.Queries.ProductQueries;
using ApplicationLayer.CQRS.Queries.ProductQueries;
using ApplicationLayer.DTOs;
using ApplicationLayer.Wrappers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<ServiceResponse<List<ProductDto>>>> GetAll()
        {
            var result = await _mediator.Send(new GetAllProductsQuery());
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ServiceResponse<ProductDto>>> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetProductByIdQuery { Id = id });
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [HttpGet("byseller/{seller}")]
        public async Task<ActionResult<ServiceResponse<List<ProductDto>>>> GetBySeller(string seller)
        {
            var result = await _mediator.Send(new GetProductsBySellerQuery { Seller = seller });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ServiceResponse<Guid>>> Create([FromBody] CreateProductCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ServiceResponse<Guid>>> Update([FromBody] UpdateProductCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ServiceResponse<Guid>>> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteProductCommand { Id = id });
            if (!result.Success)
                return NotFound(result);
            return Ok(result);
        }
    }
}