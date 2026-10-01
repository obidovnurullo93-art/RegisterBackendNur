using FluentValidation;
using RegisterBackendNur.JWT.Models.Db;

namespace RegisterBackendNur.FluentValidation
{
    public class RegisterValidator : AbstractValidator<RegisterModel>
    {
        public RegisterValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .WithMessage("Введите корректный email");

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(8)
                .WithMessage("Пароль должен содержать минимум 8 символов");

            RuleFor(x => x.Phone)
                .NotEmpty()
                .Matches(@"^\+992\d{}$")
                .WithMessage("Введите номер в формате +992XXXXXXXXX");
        }
    }
}