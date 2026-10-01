using RegisterBackendNur.JWT.Models.Db;

namespace RegisterBackendNur.Services.Interface
{
    public interface IServicesRentHub
    {
        Task<RegisterModel?> GetByEmailAsync(string email);
        Task AddAsync(RegisterModel regismodel);
        bool VerifyPassword(RegisterModel user, string password);
    }
}
