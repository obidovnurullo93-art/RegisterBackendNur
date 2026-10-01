using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RegisterBackendNur.JWT.Models.Db;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RegisterBackendNur.JWT
{
    public class JWTServices(IOptions<AusSettings> option)
    {
        public string GenerateToken(RegisterModel model)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, model.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, model.Id.ToString()),
                new Claim(ClaimTypes.Name, model.Name),
                new Claim(JwtRegisteredClaimNames.Email, model.Email),
                new Claim("phone", model.Phone),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(option.Value.SecretKey));

            var jwtToken = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.Add(option.Value.Expires),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
    }
}
