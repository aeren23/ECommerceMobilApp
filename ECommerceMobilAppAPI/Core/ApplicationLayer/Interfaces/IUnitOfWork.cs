using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApplicationLayer.Interfaces
{
    public interface IUnitOfWork : IAsyncDisposable
    {
        IRepository<T> GetRepository<T>() where T :class, new();
        Task<int> SaveAsync();
        int Save();
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}
