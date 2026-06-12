using RaintreeEMS.Models;

namespace RaintreeEMS.Repository.Interfaces;

public interface IDepartmentRepository
{
    Task<List<Department>> GetAllAsync();
    Task<Department?> GetByIdAsync(int id);
    Task<int> CreateAsync(Department department);
    Task UpdateAsync(Department department);

    /// <summary>Returns the result code and message from sp_DeleteDepartment
    /// (result = -1 if employees still reference this department).</summary>
    Task<(int Result, string Message)> DeleteAsync(int id);

    /// <summary>Checks whether any employee belongs to the given department.</summary>
    Task<bool> HasEmployeesAsync(int departmentId);
}
