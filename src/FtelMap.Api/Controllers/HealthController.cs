using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FtelMap.Infrastructure.Data;

namespace FtelMap.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Services = new
            {
                Api = "Running",
                Database = await CheckDatabaseConnection()
            }
        };

        return Ok(health);
    }

    private async Task<string> CheckDatabaseConnection()
    {
        try
        {
            await _context.Database.CanConnectAsync();
            return "Connected";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database connection failed");
            return "Disconnected";
        }
    }
}