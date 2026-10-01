using RegisterBackendNur.JWT.Models.Db;

namespace RegisterBackendNur.Repository.Interface
{
    public interface IRegisterUser
    {
        Task<RegisterModel?> GetByEmailAsync(string email);
        Task AddAsync(RegisterModel regismodel);
    }
}
