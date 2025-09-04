using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FtelMap.Application.DTOs;
using FtelMap.Core.Entities;
using FtelMap.Core.Interfaces;
using System.Security.Claims;

namespace FtelMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(IUnitOfWork unitOfWork, ILogger<ProjectsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        var projects = await _unitOfWork.Projects.GetAllAsync();
        
        // Filter projects based on user role
        if (userRole != "Admin" && !string.IsNullOrEmpty(userId))
        {
            projects = projects.Where(p => p.OwnerId == Guid.Parse(userId));
        }
        
        var projectDtos = projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            BackgroundColor = p.BackgroundColor,
            TextColor = p.TextColor,
            Position = p.Position,
            OwnerId = p.OwnerId,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            CreatedBy = p.CreatedBy,
            UpdatedBy = p.UpdatedBy,
            IsDeleted = p.IsDeleted
        });
        return Ok(projectDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetById(Guid id)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        if (project == null)
        {
            return NotFound();
        }
        
        // Check authorization
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole != "Admin" && project.OwnerId != Guid.Parse(userId))
        {
            return Forbid();
        }
        
        var projectDto = new ProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            BackgroundColor = project.BackgroundColor,
            TextColor = project.TextColor,
            Position = project.Position,
            OwnerId = project.OwnerId,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            CreatedBy = project.CreatedBy,
            UpdatedBy = project.UpdatedBy,
            IsDeleted = project.IsDeleted
        };
        return Ok(projectDto);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create(CreateProjectDto createDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = createDto.Title,
            Description = createDto.Description,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            BackgroundColor = createDto.BackgroundColor,
            TextColor = createDto.TextColor,
            Position = createDto.Position,
            OwnerId = string.IsNullOrEmpty(userId) ? createDto.OwnerId : Guid.Parse(userId)
        };
        
        await _unitOfWork.Projects.AddAsync(project);
        await _unitOfWork.SaveChangesAsync();
        
        var projectDto = new ProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            BackgroundColor = project.BackgroundColor,
            TextColor = project.TextColor,
            Position = project.Position,
            OwnerId = project.OwnerId,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            CreatedBy = project.CreatedBy,
            UpdatedBy = project.UpdatedBy,
            IsDeleted = project.IsDeleted
        };
        
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, projectDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateProjectDto updateDto)
    {
        var existingProject = await _unitOfWork.Projects.GetByIdAsync(id);
        if (existingProject == null)
        {
            return NotFound();
        }
        
        // Check authorization
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole != "Admin" && existingProject.OwnerId != Guid.Parse(userId))
        {
            return Forbid();
        }

        existingProject.Title = updateDto.Title;
        existingProject.Description = updateDto.Description;
        existingProject.StartDate = updateDto.StartDate;
        existingProject.EndDate = updateDto.EndDate;
        existingProject.BackgroundColor = updateDto.BackgroundColor;
        existingProject.TextColor = updateDto.TextColor;
        existingProject.Position = updateDto.Position;
        existingProject.OwnerId = updateDto.OwnerId;

        await _unitOfWork.Projects.UpdateAsync(existingProject);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        if (project == null)
        {
            return NotFound();
        }
        
        // Check authorization
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole != "Admin" && project.OwnerId != Guid.Parse(userId))
        {
            return Forbid();
        }

        await _unitOfWork.Projects.DeleteAsync(project);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}