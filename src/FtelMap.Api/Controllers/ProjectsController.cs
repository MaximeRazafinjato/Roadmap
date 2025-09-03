using Microsoft.AspNetCore.Mvc;
using FtelMap.Application.DTOs;
using FtelMap.Core.Entities;
using FtelMap.Core.Interfaces;

namespace FtelMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var projects = await _unitOfWork.Projects.GetAllAsync();
        var projectDtos = projects.Select(p => new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Status = p.Status,
            Budget = p.Budget,
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
        
        var projectDto = new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            Status = project.Status,
            Budget = project.Budget,
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
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = createDto.Name,
            Description = createDto.Description,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            Status = createDto.Status,
            Budget = createDto.Budget,
            OwnerId = createDto.OwnerId
        };
        
        await _unitOfWork.Projects.AddAsync(project);
        await _unitOfWork.SaveChangesAsync();
        
        var projectDto = new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            Status = project.Status,
            Budget = project.Budget,
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

        existingProject.Name = updateDto.Name;
        existingProject.Description = updateDto.Description;
        existingProject.StartDate = updateDto.StartDate;
        existingProject.EndDate = updateDto.EndDate;
        existingProject.Status = updateDto.Status;
        existingProject.Budget = updateDto.Budget;
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

        await _unitOfWork.Projects.DeleteAsync(project);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}