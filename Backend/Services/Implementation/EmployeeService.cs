using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Services.Implementation;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repo;
    public EmployeeService(IEmployeeRepository repo) => _repo = repo;

    public async Task<List<Employee>> GetAllAsync() => await _repo.GetAllAsync();

    public async Task<Employee?> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);

    public async Task<ApiResponse<int>> CreateAsync(EmployeeRequest request)
    {
        var validationError = Validate(request);
        if (validationError != null)
            return new ApiResponse<int> { Success = false, Message = validationError };

        //if (await _repo.CodeExistsAsync(request.EmployeeCode))
        //    return new ApiResponse<int> { Success = false, Message = "Employee code already exists" };

        var employee = MapToEntity(request);
        var (newId, message) = await _repo.CreateAsync(employee);

        return newId > 0
            ? new ApiResponse<int> { Success = true, Message = message, Data = newId }
            : new ApiResponse<int> { Success = false, Message = message };
    }

    public async Task<ApiResponse<bool>> UpdateAsync(int id, EmployeeRequest request)
    {
        var validationError = Validate(request);
        if (validationError != null)
            return new ApiResponse<bool> { Success = false, Message = validationError };

        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return new ApiResponse<bool> { Success = false, Message = "Employee not found" };

        //if (!string.Equals(existing.EmployeeCode, request.EmployeeCode, StringComparison.OrdinalIgnoreCase)
        //    && await _repo.CodeExistsAsync(request.EmployeeCode))
        //    return new ApiResponse<bool> { Success = false, Message = "Employee code already exists" };

        var employee = MapToEntity(request);
        employee.EmployeeId = id;
        employee.EmployeeCode = request.EmployeeCode;

        await _repo.UpdateAsync(employee);
        return new ApiResponse<bool> { Success = true, Message = "Employee updated successfully", Data = true };
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var existing = await _repo.GetByIdAsync(id);
        if (existing == null)
            return new ApiResponse<bool> { Success = false, Message = "Employee not found" };

        await _repo.DeleteAsync(id);
        return new ApiResponse<bool> { Success = true, Message = "Deleted successfully", Data = true };
    }

    private static string? Validate(EmployeeRequest r)
    {
        //if (string.IsNullOrWhiteSpace(r.EmployeeCode))  return "Employee code is required";
        if (string.IsNullOrWhiteSpace(r.EmployeeName))  return "Employee name is required";
        if (r.DepartmentId <= 0)                        return "A valid department must be selected";
        if (string.IsNullOrWhiteSpace(r.Designation))   return "Designation is required";
        if (string.IsNullOrWhiteSpace(r.Email))         return "Email is required";
        if (string.IsNullOrWhiteSpace(r.MobileNo))      return "Mobile number is required";
        if (r.JoiningDate == default)                   return "Joining date is required";
        return null;
    }

    private static Employee MapToEntity(EmployeeRequest r) => new()
    {
        EmployeeCode = r.EmployeeCode.Trim(),
        EmployeeName = r.EmployeeName.Trim(),
        DepartmentId = r.DepartmentId,
        Designation  = r.Designation.Trim(),
        Email        = r.Email.Trim(),
        MobileNo     = r.MobileNo.Trim(),
        JoiningDate  = r.JoiningDate,
        Status       = r.Status
    };
}
