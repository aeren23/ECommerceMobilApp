using ApplicationLayer.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;
using PersistenceLayer.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PersistenceLayer.Concrete
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext appDbContext;
        public UnitOfWork(AppDbContext appDbContext)
        {
            this.appDbContext = appDbContext;
        }
        public async ValueTask DisposeAsync()
        {
            await appDbContext.DisposeAsync();
        }

        public int Save()
        {
            return appDbContext.SaveChanges();
        }

        public async Task<int> SaveAsync()
        {
            return await appDbContext.SaveChangesAsync();
        }

        IRepository<T> IUnitOfWork.GetRepository<T>()
        {
            return new Repository<T>(appDbContext);
        }
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await appDbContext.Database.BeginTransactionAsync();
        }
    }
}
