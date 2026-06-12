using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Controllers;

[ApiController]
[Route("api/[controller]")] 
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    public DashboardController(IDashboardService dashboardService) => _dashboardService = dashboardService;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats() => Ok(await _dashboardService.GetStatsAsync());

    [HttpGet("employees/{status}")]
    public async Task<IActionResult> GetEmployeesByStatus(string status)
        => Ok(await _dashboardService.GetEmployeesByStatusAsync(status));
}
