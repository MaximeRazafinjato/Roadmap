using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FtelMap.Application.DTOs.Users;
using FtelMap.Core.Entities;

namespace FtelMap.Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserListDto>> GetAllUsersAsync();
        Task<UserListDto?> GetUserByIdAsync(Guid id);
        Task<bool> UpdateUserAsync(Guid id, UpdateUserDto dto);
        Task<bool> UpdateUserRoleAsync(Guid id, string role);
        Task<bool> UpdateUserStatusAsync(Guid id, bool isActive);
        Task<bool> DeleteUserAsync(Guid id);
        Task<bool> UserExistsAsync(Guid id);
    }
}