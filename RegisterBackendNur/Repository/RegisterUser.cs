using Microsoft.EntityFrameworkCore;
using RegisterBackendNur.JWT.Models;
using RegisterBackendNur.JWT.Models.Db;
using RegisterBackendNur.Repository.Interface;

namespace RegisterBackendNur.Repository
{
    public class RegisterUser : IRegisterUser
    {
        private readonly RentHubContext _context;

        public RegisterUser(RentHubContext context)
        {
            _context = context;
        }

        public async Task<RegisterModel?> GetByEmailAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLower();
            return await _context.RegisterModels.FirstOrDefaultAsync(e => e.Email.ToLower() == normalizedEmail);
        }


        public async Task AddAsync(RegisterModel regismodel)
        {
            await _context.RegisterModels.AddAsync(regismodel);
            await _context.SaveChangesAsync();
        }
    }
}
