using RaintreeEMS.Models;

namespace RaintreeEMS.Services.Interfaces;

public interface IReportService
{
    Task<List<Employee>> GetEmployeeReportByDepartmentAsync();
}
