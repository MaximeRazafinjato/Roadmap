using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FtelMap.Application.DTOs.Authentication;
using FtelMap.Application.Interfaces;
using FtelMap.Core.Entities;
using FtelMap.Core.Interfaces;
using BCrypt.Net;

namespace FtelMap.Infrastructure.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;

        public AuthenticationService(IUnitOfWork unitOfWork, ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var users = await _unitOfWork.Repository<User>().FindAsync(x => x.Email == loginDto.Email);
            var user = users.FirstOrDefault();

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            if (!user.IsActive)
            {
                return null;
            }

            return await GenerateTokenResponse(user);
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
        {
            var existingUsers = await _unitOfWork.Repository<User>().FindAsync(
                x => x.Email == registerDto.Email || x.Username == registerDto.Username);

            if (existingUsers.Any())
            {
                return null;
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = registerDto.Email,
                Username = registerDto.Username,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                IsActive = true,
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<User>().AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return await GenerateTokenResponse(user);
        }

        public async Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(refreshTokenDto.Token);
            if (principal == null)
            {
                return null;
            }

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return null;
            }

            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userGuid);
            if (user == null || user.RefreshToken != refreshTokenDto.RefreshToken || 
                user.RefreshTokenExpiryTime <= DateTime.UtcNow || !user.IsActive)
            {
                return null;
            }

            return await GenerateTokenResponse(user);
        }

        public async Task<bool> RevokeTokenAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var userGuid))
            {
                return false;
            }

            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userGuid);
            if (user == null)
            {
                return false;
            }

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<User>().UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        private async Task<AuthResponseDto> GenerateTokenResponse(User user)
        {
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var expirationTime = DateTime.UtcNow.AddDays(7);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = expirationTime;
            user.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Repository<User>().UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = expirationTime,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role
                }
            };
        }
    }
}