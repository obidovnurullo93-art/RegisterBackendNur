using Microsoft.EntityFrameworkCore;
using RegisterBackendNur.JWT.Models.Db;

namespace RegisterBackendNur.JWT.Models
{
    public class RentHubContext : DbContext
    {
        public DbSet<RegisterModel> RegisterModels { get; set; }

        public RentHubContext(DbContextOptions<RentHubContext> options) : base(options)
        {
        }
    }
}
