using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Services.Implementation;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepo;
    private readonly IEmployeeRepository _employeeRepo;

    public DashboardService(IDashboardRepository dashboardRepo, IEmployeeRepository employeeRepo)
    {
        _dashboardRepo = dashboardRepo;
        _employeeRepo  = employeeRepo;
    }

    public async Task<DashboardStats> GetStatsAsync() => await _dashboardRepo.GetStatsAsync();

    public async Task<List<Employee>> GetEmployeesByStatusAsync(string status)
    {
        var normalized = status.Trim();
        if (normalized.Length > 0)
            normalized = char.ToUpper(normalized[0]) + normalized.Substring(1).ToLower();

        return await _employeeRepo.GetByStatusAsync(normalized);
    }
}
