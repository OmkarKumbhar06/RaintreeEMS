using RaintreeEMS.Models;

namespace RaintreeEMS.Repository.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardStats> GetStatsAsync();
}
