using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RaintreeEMS.Models;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Controllers;

[ApiController]
[Route("api/[controller]s")] 
[Authorize]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _deptService;
    public DepartmentController(IDepartmentService deptService) => _deptService = deptService;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _deptService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dept = await _deptService.GetByIdAsync(id);
        return dept != null ? Ok(dept) : NotFound();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(DepartmentRequest request)
    {
        var result = await _deptService.CreateAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, DepartmentRequest request)
    {
        var result = await _deptService.UpdateAsync(id, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _deptService.DeleteAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
