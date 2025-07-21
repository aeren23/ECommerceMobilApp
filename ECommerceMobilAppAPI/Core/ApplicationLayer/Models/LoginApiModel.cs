using ApplicationLayer.DTOs.AppUser;

namespace ApplicationLayer.Models
{
    public class LoginApiModel
    {
        public AppUserDto User { get; set; }
        public string Token { get; set; }
    }
}
