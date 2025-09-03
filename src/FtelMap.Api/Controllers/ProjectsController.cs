using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        var projects = await _unitOfWork.Projects.GetAllAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetById(Guid id)
    {
        var project = await _unitOfWork.Projects.GetByIdAsync(id);
        if (project == null)
        {
            return NotFound();
        }
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<Project>> Create(Project project)
    {
        project.Id = Guid.NewGuid();
        await _unitOfWork.Projects.AddAsync(project);
        await _unitOfWork.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Project project)
    {
        if (id != project.Id)
        {
            return BadRequest();
        }

        var existingProject = await _unitOfWork.Projects.GetByIdAsync(id);
        if (existingProject == null)
        {
            return NotFound();
        }

        await _unitOfWork.Projects.UpdateAsync(project);
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