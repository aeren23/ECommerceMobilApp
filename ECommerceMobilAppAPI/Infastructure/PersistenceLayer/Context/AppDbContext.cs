using DomainLayer.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersistenceLayer.Context
{
    public class AppDbContext : IdentityDbContext<AppUser, AppRole, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<Cart> Carts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<CouponProduct> CouponProducts { get; set; }
        public DbSet<CouponUsage> CouponUsages { get; set; }



        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Product - Tags (Value Conversion for List<string>)
            builder.Entity<Product>()
                .Property(p => p.Tags)
                .HasConversion(
                    v => string.Join(';', v),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            // Coupon - Product many-to-many relationship
            builder.Entity<CouponProduct>()
                .HasKey(cp => new { cp.CouponId, cp.ProductId });

            builder.Entity<CouponProduct>()
                .HasOne(cp => cp.Coupon)
                .WithMany(c => c.CouponProducts)
                .HasForeignKey(cp => cp.CouponId);

            builder.Entity<CouponProduct>()
                .HasOne(cp => cp.Product)
                .WithMany(p => p.CouponProducts)
                .HasForeignKey(cp => cp.ProductId);

            // Coupon code unique constraint
            builder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();
        }
    }
}
