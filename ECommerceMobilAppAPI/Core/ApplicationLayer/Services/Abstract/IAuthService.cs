using ApplicationLayer.DTOs.AppUser;
using ApplicationLayer.Models;
using ApplicationLayer.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface IAuthService
    {
        Task<ServiceResponse<Guid>> RegisterAsync(RegisterUserDto dto);
        Task<ServiceResponse<LoginApiModel>> LoginAsync(LoginUserDto dto);
    }
}
