using ApplicationLayer.Interfaces;
using ApplicationLayer.Services.Abstract;
using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Concrete
{
    public class WishlistService : IWishlistService
    {
        private readonly IUnitOfWork _unitOfWork;

        public WishlistService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task AddToWishlistAsync(Guid userId, Guid productId)
        {
            var wishlistRepository = _unitOfWork.GetRepository<Wishlist>();
            var wishlistItemRepository = _unitOfWork.GetRepository<WishlistItem>();

            var wishlist = await wishlistRepository.GetSingleOrDefaultAsync(
                w => w.UserId == userId,
                w => w.Items
            );

            if (wishlist == null)
            {
                wishlist = new Wishlist { UserId = userId };
                await wishlistRepository.AddAsync(wishlist);
                await _unitOfWork.SaveAsync();
            }

            if (!wishlist.Items.Any(i => i.ProductId == productId))
            {
                var wishlistItem = new WishlistItem
                {
                    ProductId = productId,
                    WishlistId = wishlist.Id
                };
                await wishlistItemRepository.AddAsync(wishlistItem);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task RemoveFromWishlistAsync(Guid userId, Guid productId)
        {
            var wishlistRepository = _unitOfWork.GetRepository<Wishlist>();
            var wishlistItemRepository = _unitOfWork.GetRepository<WishlistItem>();

            var wishlist = await wishlistRepository.GetAsync(
                w => w.UserId == userId,
                w => w.Items
            );

            if (wishlist == null) return;

            var item = wishlist.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                await wishlistItemRepository.DeleteAsync(item);
                await _unitOfWork.SaveAsync();
            }
        }

        public async Task<IList<Guid>> GetWishlistAsync(Guid userId)
        {
            var wishlistRepository = _unitOfWork.GetRepository<Wishlist>();

            var wishlist = await wishlistRepository.GetSingleOrDefaultAsync(
                w => w.UserId == userId,
                w => w.Items
            );

            return wishlist?.Items.Select(i => i.ProductId).ToList() ?? new List<Guid>();
        }

        public async Task ClearWishlistAsync(Guid userId)
        {
            var wishlistRepository = _unitOfWork.GetRepository<Wishlist>();
            var wishlistItemRepository = _unitOfWork.GetRepository<WishlistItem>();

            var wishlist = await wishlistRepository.GetAsync(
                w => w.UserId == userId,
                w => w.Items
            );

            if (wishlist == null) return;

            foreach (var item in wishlist.Items.ToList())
            {
                await wishlistItemRepository.DeleteAsync(item);
            }

            await _unitOfWork.SaveAsync();
        }
    }
}