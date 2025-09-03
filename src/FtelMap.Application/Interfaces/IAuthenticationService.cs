using System.Threading.Tasks;
using FtelMap.Application.DTOs.Authentication;

namespace FtelMap.Application.Interfaces
{
    public interface IAuthenticationService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
        Task<bool> RevokeTokenAsync(string userId);
    }
}