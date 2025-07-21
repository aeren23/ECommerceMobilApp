using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using Microsoft.Extensions.DependencyInjection;
using PersistenceLayer.Context;
using Microsoft.AspNetCore.Identity;
using DomainLayer.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using ApplicationLayer.Interfaces;
using PersistenceLayer.Concrete;

namespace PersistenceLayer
{
    public static class PersistenceConfig
    {
        public static void AddPersistenceServices(this IServiceCollection services, string connectionString)
        {
            // DbContext ve Identity için gerekli servisler
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            // Identity servisleris
            services.AddIdentity<AppUser, AppRole>(options =>

                {
                    // İsteğe bağlı: Identity ayarlarını burada özelleştirebilirsin
                    options.Password.RequireDigit = true;
                    options.Password.RequiredLength = 6;
                    options.User.RequireUniqueEmail = true;
                })
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();

            // Repository ve UnitOfWork servisleri
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
        }
    }
}
