using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RegisterBackendNur.FluentValidation;
using RegisterBackendNur.JWT;
using RegisterBackendNur.JWT.Models.Db;
using RegisterBackendNur.JWT.Models;
using RegisterBackendNur.Repository;
using RegisterBackendNur.Repository.Interface;
using RegisterBackendNur.Services;
using RegisterBackendNur.Services.Interface;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Services
builder.Services.AddScoped<IServicesRentHub, ServicesRentHub>();
builder.Services.AddScoped<JWTServices>();
builder.Services.AddScoped<FluentValidation.IValidator<RegisterModel>, RegisterValidator>();

// Repository
builder.Services.AddScoped<IRegisterUser, RegisterUser>();

// DbContext
var connection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<RentHubContext>(options =>
    options.UseSqlServer(connection));

// JWT settings
builder.Services.Configure<AusSettings>(builder.Configuration.GetSection("AusSettings"));

var aus = builder.Configuration.GetSection("AusSettings").Get<AusSettings>()
          ?? throw new InvalidOperationException("Секция AusSettings не найдена в appsettings.json");

// Authentication (только JWT)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(aus.SecretKey))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();   // сначала «кто ты»
app.UseAuthorization();    // потом «что тебе можно»

app.MapControllers();

app.Run();