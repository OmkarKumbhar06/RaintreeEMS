using RaintreeEMS.Models;

namespace RaintreeEMS.Repository.Interfaces;

public interface IEmployeeRepository
{
    Task<List<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(int id);

    /// <summary>Returns the new EmployeeId and a message (id = -1 if EmployeeCode already exists).</summary>
    Task<(int EmployeeId, string Message)> CreateAsync(Employee employee);
    Task UpdateAsync(Employee employee);
    Task DeleteAsync(int id);

    /// <summary>Checks whether an employee with the given code already exists.</summary>
    //Task<bool> CodeExistsAsync(string employeeCode);

    /// <summary>Returns employees filtered by status (Active/Inactive), used for dashboard drill-down.</summary>
    Task<List<Employee>> GetByStatusAsync(string status);

    /// <summary>Returns all employees joined with department, ordered by department for reporting.</summary>
    Task<List<Employee>> GetEmployeeReportByDepartmentAsync();
}
