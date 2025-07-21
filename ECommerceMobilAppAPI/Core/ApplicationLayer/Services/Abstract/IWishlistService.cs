using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Services.Abstract
{
    public interface IWishlistService
    {
        Task AddToWishlistAsync(Guid userId, Guid productId);
        Task RemoveFromWishlistAsync(Guid userId, Guid productId);
        Task<IList<Guid>> GetWishlistAsync(Guid userId);
        Task ClearWishlistAsync(Guid userId);
    }
}
