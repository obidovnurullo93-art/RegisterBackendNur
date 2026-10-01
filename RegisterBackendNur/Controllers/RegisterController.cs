using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using RegisterBackendNur.JWT;
using RegisterBackendNur.JWT.Models.Db;
using RegisterBackendNur.Models;
using RegisterBackendNur.Services.Interface;

namespace RegisterBackendNur.Controllers;

[ApiController]
[Route("api/auth")]
public class RegisterController : ControllerBase
{
    private readonly IServicesRentHub _users;
    private readonly JWTServices _jwt;
    private readonly IValidator<RegisterModel> _validator;

    public RegisterController(IServicesRentHub users, JWTServices jwt, IValidator<RegisterModel> validator)
    {
        _users = users;
        _jwt = jwt;
        _validator = validator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var model = new RegisterModel
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            Password = request.Password
        };

        var validation = await _validator.ValidateAsync(model);
        if (!validation.IsValid)
            return BadRequest(new { message = validation.Errors[0].ErrorMessage });

        if (await _users.GetByEmailAsync(model.Email) is not null)
            return Conflict(new { message = "Пользователь с таким email уже зарегистрирован." });

        await _users.AddAsync(model);
        return Ok(new TokenResponse(_jwt.GenerateToken(model)));
    }



    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email и пароль обязательны." });

        var user = await _users.GetByEmailAsync(request.Email);
        if (user is null || !_users.VerifyPassword(user, request.Password))
            return Unauthorized(new { message = "Неверный email или пароль." });

        return Ok(new TokenResponse(_jwt.GenerateToken(user)));
    }
}