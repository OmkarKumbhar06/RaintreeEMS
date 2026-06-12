using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Services.Implementation;

public class ReportService : IReportService
{
    private readonly IEmployeeRepository _employeeRepo;
    public ReportService(IEmployeeRepository employeeRepo) => _employeeRepo = employeeRepo;

    public async Task<List<Employee>> GetEmployeeReportByDepartmentAsync()
        => await _employeeRepo.GetEmployeeReportByDepartmentAsync();
}
