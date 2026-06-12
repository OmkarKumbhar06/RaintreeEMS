using RaintreeEMS.Models;

namespace RaintreeEMS.Services.Interfaces;

public interface IDepartmentService
{
    Task<List<Department>> GetAllAsync();
    Task<Department?> GetByIdAsync(int id);
    Task<ApiResponse<int>> CreateAsync(DepartmentRequest request);
    Task<ApiResponse<bool>> UpdateAsync(int id, DepartmentRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
