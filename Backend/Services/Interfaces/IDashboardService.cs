using RaintreeEMS.Models;

namespace RaintreeEMS.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardStats> GetStatsAsync();
    Task<List<Employee>> GetEmployeesByStatusAsync(string status);
}
