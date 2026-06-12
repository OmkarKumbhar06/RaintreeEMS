using RaintreeEMS.Models;

namespace RaintreeEMS.Services.Interfaces;

public interface IEmployeeService
{
    Task<List<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(int id);
    Task<ApiResponse<int>> CreateAsync(EmployeeRequest request);
    Task<ApiResponse<bool>> UpdateAsync(int id, EmployeeRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
