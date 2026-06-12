using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RaintreeEMS.Models;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Controllers;

[ApiController]
[Route("api/[controller]s")] // -> /api/employees
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _empService;
    public EmployeeController(IEmployeeService empService) => _empService = empService;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _empService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var emp = await _empService.GetByIdAsync(id);
        return emp != null ? Ok(emp) : NotFound();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(EmployeeRequest request)
    {
        var result = await _empService.CreateAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, EmployeeRequest request)
    {
        var result = await _empService.UpdateAsync(id, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _empService.DeleteAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
