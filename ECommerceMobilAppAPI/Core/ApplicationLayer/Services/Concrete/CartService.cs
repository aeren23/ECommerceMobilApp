using ApplicationLayer.DTOs.Cart;
using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using ApplicationLayer.Wrappers;
using AutoMapper;
using DomainLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApplicationLayer.Services
{
    public class CartService : ICartService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICouponService _couponService;

        public CartService(IUnitOfWork unitOfWork, IMapper mapper, ICouponService couponService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _couponService = couponService;
        }

        public async Task<ServiceResponse<CartDto>> GetCartByUserIdAsync(Guid userId)
        {
            var cartRepo = _unitOfWork.GetRepository<Cart>();
            var cart = await cartRepo.GetSingleOrDefaultAsync(c => c.UserId == userId, c => c.Items);
            if (cart == null)
                return new ServiceResponse<CartDto>("Cart not found.");

            // Ürün detaylarını doldurmak için
            foreach (var item in cart.Items)
            {
                item.Product = await _unitOfWork.GetRepository<Product>().GetAsync(x => x.Id == item.ProductId, p => p.Category);
            }

            var dto = _mapper.Map<CartDto>(cart);
            return new ServiceResponse<CartDto>(dto);
        }

        public async Task<ServiceResponse<bool>> AddItemAsync(Guid userId, Guid productId, int quantity)
        {
            // Kuponsuz ekleme için AddItemWithCouponAsync'i null coupon ile çağır
            return await AddItemWithCouponAsync(userId, productId, quantity, null);
        }

        public async Task<ServiceResponse<bool>> AddItemWithCouponAsync(Guid userId, Guid productId, int quantity, string? couponCode = null)
        {
            var cartRepo = _unitOfWork.GetRepository<Cart>();
            var cartItemRepo = _unitOfWork.GetRepository<CartItem>();
            var productRepo = _unitOfWork.GetRepository<Product>();

            var cart = await cartRepo.GetSingleOrDefaultAsync(c => c.UserId == userId, c => c.Items);
            if (cart == null)
            {
                cart = new Cart { UserId = userId, Items = new List<CartItem>() };
                await cartRepo.AddAsync(cart);
                await _unitOfWork.SaveAsync();
            }

            var product = await productRepo.GetByGuidAsync(productId);
            if (product == null)
                return new ServiceResponse<bool>("Product not found.");

            // Kupon kodu temizliği
            if (string.IsNullOrWhiteSpace(couponCode))
                couponCode = null;

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            
            if (existingItem == null)
            {
                // Yeni item ekle
                decimal unitPrice = product.Price;
                string? appliedCouponCode = null;

                // Kupon varsa doğrula ve birim fiyatı hesapla
                if (!string.IsNullOrEmpty(couponCode))
                {
                    var couponValidation = await _couponService.ValidateCouponAsync(couponCode, productId, quantity, unitPrice);
                    if (!couponValidation.Success || !couponValidation.Value.IsValid)
                        return new ServiceResponse<bool>(couponValidation.ErrorMessage ?? couponValidation.Value.Message);

                    unitPrice = couponValidation.Value.FinalPrice / quantity; // İndirimli birim fiyat
                    appliedCouponCode = couponCode;
                }

                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    Price = unitPrice,
                    AppliedCouponCode = appliedCouponCode
                };
                await cartItemRepo.AddAsync(newItem);
            }
            else
            {
                // Mevcut item'ı güncelle
                int newTotalQuantity = existingItem.Quantity + quantity;
                decimal unitPrice = product.Price;
                string? appliedCouponCode = null;

                // Kupon varsa yeni toplam miktar için fiyatı yeniden hesapla
                if (!string.IsNullOrEmpty(couponCode))
                {
                    var couponValidation = await _couponService.ValidateCouponAsync(couponCode, productId, newTotalQuantity, unitPrice);
                    if (!couponValidation.Success || !couponValidation.Value.IsValid)
                        return new ServiceResponse<bool>(couponValidation.ErrorMessage ?? couponValidation.Value.Message);
                    
                    unitPrice = couponValidation.Value.FinalPrice / newTotalQuantity; // İndirimli birim fiyat
                    appliedCouponCode = couponCode;
                }

                existingItem.Quantity = newTotalQuantity;
                existingItem.Price = unitPrice;
                existingItem.AppliedCouponCode = appliedCouponCode;
                await cartItemRepo.UpdateAsync(existingItem);
            }

            UpdateCartTotalPrice(cart);
            await cartRepo.UpdateAsync(cart);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<bool>(true);
        }

        public async Task<ServiceResponse<bool>> RemoveItemAsync(Guid userId, Guid productId)
        {
            var cartRepo = _unitOfWork.GetRepository<Cart>();
            var cartItemRepo = _unitOfWork.GetRepository<CartItem>();

            var cart = await cartRepo.GetAsync(c => c.UserId == userId, c => c.Items);
            if (cart == null) return new ServiceResponse<bool>("Cart not found.");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                await cartItemRepo.DeleteAsync(item);
                cart.Items.Remove(item);
                UpdateCartTotalPrice(cart);
                await cartRepo.UpdateAsync(cart);
                await _unitOfWork.SaveAsync();
            }
            return new ServiceResponse<bool>(true);
        }

        public async Task<ServiceResponse<bool>> ClearCartAsync(Guid userId)
        {
            var cartRepo = _unitOfWork.GetRepository<Cart>();
            var cartItemRepo = _unitOfWork.GetRepository<CartItem>();

            var cart = await cartRepo.GetAsync(c => c.UserId == userId, c => c.Items);
            if (cart == null) return new ServiceResponse<bool>("Cart not found.");

            foreach (var item in cart.Items.ToList())
            {
                await cartItemRepo.DeleteAsync(item);
            }
            cart.Items.Clear();
            cart.TotalPrice = 0;
            await cartRepo.UpdateAsync(cart);
            await _unitOfWork.SaveAsync();
            return new ServiceResponse<bool>(true);
        }

        // Sepetten sipariş oluştur ve kupon kullanımlarını kaydet
        public async Task<ServiceResponse<Guid>> CreateOrderFromCartAsync(Guid userId)
        {
            var cartRepo = _unitOfWork.GetRepository<Cart>();
            var orderRepo = _unitOfWork.GetRepository<Order>();
            var productRepo = _unitOfWork.GetRepository<Product>();
            var couponRepo = _unitOfWork.GetRepository<Coupon>();

            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    var cart = await cartRepo.GetSingleOrDefaultAsync(c => c.UserId == userId, c => c.Items);
                    if (cart == null || !cart.Items.Any())
                        return new ServiceResponse<Guid>("Cart is empty.");

                    // Sipariş oluştur
                    var order = new Order
                    {
                        UserId = userId,
                        CreatedAt = DateTime.UtcNow,
                        Items = new List<OrderItem>()
                    };

                    // Stok kontrolü ve sipariş kalemleri oluşturma
                    foreach (var cartItem in cart.Items)
                    {
                        var product = await productRepo.GetByGuidAsync(cartItem.ProductId);
                        if (product == null)
                            return new ServiceResponse<Guid>($"Product not found: {cartItem.ProductId}");

                        if (cartItem.Quantity > product.Stock)
                            return new ServiceResponse<Guid>($"Insufficient stock for product: {product.Name}");

                        // Sipariş kalemi ekle
                        order.Items.Add(new OrderItem
                        {
                            ProductId = cartItem.ProductId,
                            Quantity = cartItem.Quantity,
                            Price = cartItem.Price // Bu zaten indirimli birim fiyat
                        });

                        // Stoktan düş
                        product.Stock -= cartItem.Quantity;
                        await productRepo.UpdateAsync(product);
                    }

                    order.TotalPrice = order.Items.Sum(i => i.Price * i.Quantity);
                    await orderRepo.AddAsync(order);
                    await _unitOfWork.SaveAsync();

                    // Kupon kullanımlarını kaydet
                    foreach (var cartItem in cart.Items.Where(ci => !string.IsNullOrEmpty(ci.AppliedCouponCode)))
                    {
                        var coupon = await couponRepo.GetSingleOrDefaultAsync(c => c.Code == cartItem.AppliedCouponCode);
                        if (coupon != null)
                        {
                            var product = await productRepo.GetByGuidAsync(cartItem.ProductId);
                            var originalPrice = product.Price;
                            var discountAmount = (originalPrice * cartItem.Quantity) - (cartItem.Price * cartItem.Quantity);

                            await _couponService.RecordCouponUsageAsync(
                                coupon.Id,
                                userId,
                                cartItem.Quantity,
                                discountAmount,
                                order.Id
                            );
                        }
                    }

                    // Sepeti temizle
                    await ClearCartAsync(userId);

                    await transaction.CommitAsync();
                    return new ServiceResponse<Guid>(order.Id);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new ServiceResponse<Guid>($"Order creation failed: {ex.Message}");
                }
            }
        }

        private void UpdateCartTotalPrice(Cart cart)
        {
            cart.TotalPrice = cart.Items.Sum(i => i.Price * i.Quantity);
        }
    }
}