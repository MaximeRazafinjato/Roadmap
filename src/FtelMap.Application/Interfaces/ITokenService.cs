using System;
using System.Security.Claims;
using FtelMap.Core.Entities;

namespace FtelMap.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}