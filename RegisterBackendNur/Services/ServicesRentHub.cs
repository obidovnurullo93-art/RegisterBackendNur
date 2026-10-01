using RegisterBackendNur.JWT.Models.Db;
using RegisterBackendNur.Repository.Interface;
using RegisterBackendNur.Services.Interface;
using Microsoft.AspNetCore.Identity;

namespace RegisterBackendNur.Services
{
    public class ServicesRentHub : IServicesRentHub
    {
        private readonly IRegisterUser _repo;
        private readonly PasswordHasher<RegisterModel> _passwordHasher = new();


        public ServicesRentHub(IRegisterUser repo)
        {
            _repo = repo;
    
        }


        public async Task<RegisterModel> GetByEmailAsync(string email)
        {
            return await _repo.GetByEmailAsync(email);
        }


        public async Task AddAsync(RegisterModel regismodel)
        {
            var employee = await _repo.GetByEmailAsync(regismodel.Email);
            if (employee != null)
                throw new InvalidOperationException("Пользователь с таким email уже зарегистрирован.");

            regismodel.Id = Guid.NewGuid();
            regismodel.Email = regismodel.Email.Trim().ToLowerInvariant();
            regismodel.Password = _passwordHasher.HashPassword(regismodel, regismodel.Password);
            await _repo.AddAsync(regismodel);

        }



        public bool VerifyPassword(RegisterModel user, string password) =>
            _passwordHasher.VerifyHashedPassword(user, user.Password, password) == PasswordVerificationResult.Success;
    }
}
