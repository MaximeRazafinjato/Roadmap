using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FtelMap.Application.DTOs.Users;
using FtelMap.Application.Interfaces;
using System.Security.Claims;

namespace FtelMap.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserListDto>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération des utilisateurs" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserListDto>> GetUserById(Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération de l'utilisateur" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            try
            {
                // Prevent admin from modifying their own role or status
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId != null && Guid.Parse(currentUserId) == id)
                {
                    var existingUser = await _userService.GetUserByIdAsync(id);
                    if (existingUser != null)
                    {
                        dto.Role = existingUser.Role;
                        dto.IsActive = existingUser.IsActive;
                    }
                }

                var result = await _userService.UpdateUserAsync(id, dto);
                if (!result)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour de l'utilisateur" });
            }
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto dto)
        {
            try
            {
                // Prevent admin from modifying their own role
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId != null && Guid.Parse(currentUserId) == id)
                {
                    return BadRequest(new { message = "Vous ne pouvez pas modifier votre propre rôle" });
                }

                var result = await _userService.UpdateUserRoleAsync(id, dto.Role);
                if (!result)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user role for {UserId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour du rôle" });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusDto dto)
        {
            try
            {
                // Prevent admin from deactivating themselves
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId != null && Guid.Parse(currentUserId) == id && !dto.IsActive)
                {
                    return BadRequest(new { message = "Vous ne pouvez pas désactiver votre propre compte" });
                }

                var result = await _userService.UpdateUserStatusAsync(id, dto.IsActive);
                if (!result)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user status for {UserId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour du statut" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                // Prevent admin from deleting themselves
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId != null && Guid.Parse(currentUserId) == id)
                {
                    return BadRequest(new { message = "Vous ne pouvez pas supprimer votre propre compte" });
                }

                var result = await _userService.DeleteUserAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la suppression de l'utilisateur" });
            }
        }
    }
}