using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FtelMap.Application.DTOs.Users;
using FtelMap.Application.Interfaces;
using FtelMap.Core.Entities;
using FtelMap.Core.Interfaces;

namespace FtelMap.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            return users.Select(u => MapToUserListDto(u));
        }

        public async Task<UserListDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            return user != null ? MapToUserListDto(user) : null;
        }

        public async Task<bool> UpdateUserAsync(Guid id, UpdateUserDto dto)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id);
                if (user == null)
                {
                    return false;
                }

                user.Email = dto.Email;
                user.Username = dto.Username;
                user.FirstName = dto.FirstName;
                user.LastName = dto.LastName;
                user.IsActive = dto.IsActive;
                user.Role = dto.Role;

                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateUserRoleAsync(Guid id, string role)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id);
                if (user == null)
                {
                    return false;
                }

                user.Role = role;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateUserStatusAsync(Guid id, bool isActive)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id);
                if (user == null)
                {
                    return false;
                }

                user.IsActive = isActive;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id);
                if (user == null)
                {
                    return false;
                }

                await _unitOfWork.Users.DeleteAsync(user);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UserExistsAsync(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            return user != null;
        }

        private static UserListDto MapToUserListDto(User user)
        {
            return new UserListDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}