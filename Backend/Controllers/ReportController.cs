using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Controllers;

[ApiController]
[Route("api/[controller]s")] // -> /api/reports
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;
    public ReportController(IReportService reportService) => _reportService = reportService;

    [HttpGet("employee-by-department")]
    public async Task<IActionResult> EmployeeByDepartment()
        => Ok(await _reportService.GetEmployeeReportByDepartmentAsync());
}
