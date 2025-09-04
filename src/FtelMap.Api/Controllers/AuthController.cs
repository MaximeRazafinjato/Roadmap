using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FtelMap.Application.DTOs.Authentication;
using FtelMap.Application.Interfaces;
using System.Security.Claims;

namespace FtelMap.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;

        public AuthController(IAuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authenticationService.RegisterAsync(registerDto);
            if (result == null)
            {
                return BadRequest(new { message = "Un utilisateur avec cet e-mail ou ce nom d'utilisateur existe déjà" });
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authenticationService.LoginAsync(loginDto);
            if (result == null)
            {
                return Unauthorized(new { message = "E-mail ou mot de passe invalide" });
            }

            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authenticationService.RefreshTokenAsync(refreshTokenDto);
            if (result == null)
            {
                return Unauthorized(new { message = "Token de rafraîchissement invalide ou expiré" });
            }

            return Ok(result);
        }

        [Authorize]
        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await _authenticationService.RevokeTokenAsync(userId);
            if (!result)
            {
                return BadRequest(new { message = "Échec de la révocation du token" });
            }

            return Ok(new { message = "Token révoqué avec succès" });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var firstName = User.FindFirst("FirstName")?.Value;
            var lastName = User.FindFirst("LastName")?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new UserDto
            {
                Id = Guid.Parse(userId!),
                Email = email!,
                Username = username!,
                FirstName = firstName!,
                LastName = lastName!,
                Role = role
            });
        }
    }
}