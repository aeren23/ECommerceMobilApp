using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace PersistenceLayer.Context
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            var connectionString = "server=AliErenPC;initial catalog=ECommerceMobileDb;TrustServerCertificate=true;integrated security=true";

            optionsBuilder.UseSqlServer(connectionString); 

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}