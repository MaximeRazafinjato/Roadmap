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
public class StepsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StepsController> _logger;

    public StepsController(IUnitOfWork unitOfWork, ILogger<StepsController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StepDto>>> GetAll()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        var steps = await _unitOfWork.Steps.GetAllAsync();
        
        // Filter steps based on user role
        if (userRole != "Admin" && !string.IsNullOrEmpty(userId))
        {
            steps = steps.Where(s => s.OwnerId == Guid.Parse(userId));
        }
        
        var stepDtos = steps.Select(s => new StepDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            BackgroundColor = s.BackgroundColor,
            TextColor = s.TextColor,
            OwnerId = s.OwnerId,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
            CreatedBy = s.CreatedBy,
            UpdatedBy = s.UpdatedBy,
            IsDeleted = s.IsDeleted
        });
        return Ok(stepDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StepDto>> GetById(Guid id)
    {
        var step = await _unitOfWork.Steps.GetByIdAsync(id);
        if (step == null)
        {
            return NotFound();
        }
        
        // Check authorization
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole != "Admin" && step.OwnerId != Guid.Parse(userId))
        {
            return Forbid();
        }
        
        var stepDto = new StepDto
        {
            Id = step.Id,
            Title = step.Title,
            Description = step.Description,
            StartDate = step.StartDate,
            EndDate = step.EndDate,
            BackgroundColor = step.BackgroundColor,
            TextColor = step.TextColor,
            OwnerId = step.OwnerId,
            CreatedAt = step.CreatedAt,
            UpdatedAt = step.UpdatedAt,
            CreatedBy = step.CreatedBy,
            UpdatedBy = step.UpdatedBy,
            IsDeleted = step.IsDeleted
        };
        return Ok(stepDto);
    }

    [HttpPost]
    public async Task<ActionResult<StepDto>> Create(CreateStepDto createDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var step = new Step
        {
            Id = Guid.NewGuid(),
            Title = createDto.Title,
            Description = createDto.Description,
            StartDate = createDto.StartDate,
            EndDate = createDto.EndDate,
            BackgroundColor = createDto.BackgroundColor,
            TextColor = createDto.TextColor,
            OwnerId = string.IsNullOrEmpty(userId) ? createDto.OwnerId : Guid.Parse(userId)
        };
        
        await _unitOfWork.Steps.AddAsync(step);
        await _unitOfWork.SaveChangesAsync();
        
        var stepDto = new StepDto
        {
            Id = step.Id,
            Title = step.Title,
            Description = step.Description,
            StartDate = step.StartDate,
            EndDate = step.EndDate,
            BackgroundColor = step.BackgroundColor,
            TextColor = step.TextColor,
            OwnerId = step.OwnerId,
            CreatedAt = step.CreatedAt,
            UpdatedAt = step.UpdatedAt,
            CreatedBy = step.CreatedBy,
            UpdatedBy = step.UpdatedBy,
            IsDeleted = step.IsDeleted
        };
        
        return CreatedAtAction(nameof(GetById), new { id = step.Id }, stepDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateStepDto updateDto)
    {
        var existingStep = await _unitOfWork.Steps.GetByIdAsync(id);
        if (existingStep == null)
        {
            return NotFound();
        }
        
        // Check authorization
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole != "Admin" && existingStep.OwnerId != Guid.Parse(userId))
        {
            return Forbid();
        }

        existingStep.Title = updateDto.Title;
        existingStep.Description = updateDto.Description;
        existingStep.StartDate = updateDto.StartDate;
        existingStep.EndDate = updateDto.EndDate;
        existingStep.BackgroundColor = updateDto.BackgroundColor;
        existingStep.TextColor = updateDto.TextColor;
        existingStep.OwnerId = updateDto.OwnerId;

        await _unitOfWork.Steps.UpdateAsync(existingStep);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var step = await _unitOfWork.Steps.GetByIdAsync(id);
        if (step == null)
        {
            return NotFound();
        }
        
        // Check authorization
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        
        if (userRole != "Admin" && step.OwnerId != Guid.Parse(userId))
        {
            return Forbid();
        }

        await _unitOfWork.Steps.DeleteAsync(step);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}