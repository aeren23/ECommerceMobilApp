using ApplicationLayer.Services;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Services.Concrete;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer
{
    public static class ApplicationLayerConfig
    {
        public static void AddApplicationRegistration(this IServiceCollection services)
        {
            services.AddScoped<ICouponService, CouponService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<IWishlistService, WishlistService>();
            services.AddScoped<IUserProfileService, UserProfileService>();
            services.AddScoped<IRoleService, RoleService>();
            services.AddScoped<JwtTokenGenerator>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IAuthService, AuthService>();    
            services.AddScoped<ICategoryService, CategoryService>();
            var assembly = Assembly.GetExecutingAssembly();
            services.AddAutoMapper(assembly);
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        }
    }
}
