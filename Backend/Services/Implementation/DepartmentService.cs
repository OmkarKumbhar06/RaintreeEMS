using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Services.Implementation;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repo;
    public DepartmentService(IDepartmentRepository repo) => _repo = repo;

    public async Task<List<Department>> GetAllAsync() => await _repo.GetAllAsync();

    public async Task<Department?> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);

    public async Task<ApiResponse<int>> CreateAsync(DepartmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DepartmentName))
            return new ApiResponse<int> { Success = false, Message = "Department name is required" };

        var department = new Department
        {
            DepartmentName = request.DepartmentName.Trim(),
            Description    = request.Description,
            Status         = request.Status
        };

        var newId = await _repo.CreateAsync(department);
        return newId > 0
            ? new ApiResponse<int> { Success = true, Message = "Department created successfully", Data = newId }
            : new ApiResponse<int> { Success = false, Message = "Create failed" };
    }

    public async Task<ApiResponse<bool>> UpdateAsync(int id, DepartmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DepartmentName))
            return new ApiResponse<bool> { Success = false, Message = "Department name is required" };

        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return new ApiResponse<bool> { Success = false, Message = "Department not found" };

        var department = new Department
        {
            DepartmentId   = id,
            DepartmentName = request.DepartmentName.Trim(),
            Description    = request.Description,
            Status         = request.Status
        };

        await _repo.UpdateAsync(department);
        return new ApiResponse<bool> { Success = true, Message = "Department updated successfully", Data = true };
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        if (await _repo.HasEmployeesAsync(id))
            return new ApiResponse<bool> { Success = false, Message = "Cannot delete: employees exist in this department" };

        var (result, message) = await _repo.DeleteAsync(id);
        return new ApiResponse<bool> { Success = result == 1, Message = message, Data = result == 1 };
    }
}
