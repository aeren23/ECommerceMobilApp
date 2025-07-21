using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize(Roles = "Admin")] // Sadece adminler erişsin örneği
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] string roleName)
        {
            var result = await _roleService.CreateRoleAsync(roleName);
            if (result)
                return Ok();
            return BadRequest("Role already exists or could not be created.");
        }

        [HttpDelete("{roleName}")]
        public async Task<IActionResult> Delete(string roleName)
        {
            var result = await _roleService.DeleteRoleAsync(roleName);
            if (result)
                return Ok();
            return NotFound();
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromQuery] string oldRoleName, [FromQuery] string newRoleName)
        {
            var result = await _roleService.UpdateRoleAsync(oldRoleName, newRoleName);
            if (result)
                return Ok();
            return NotFound();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _roleService.GetRolesAsync();
            return Ok(roles);
        }
    }
}