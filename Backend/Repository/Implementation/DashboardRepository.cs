using Microsoft.Data.SqlClient;
using RaintreeEMS.Helpers;
using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;

namespace RaintreeEMS.Repository.Implementation;

public class DashboardRepository : IDashboardRepository
{
    private readonly MsSqlHelper _sql;
    public DashboardRepository(MsSqlHelper sql) => _sql = sql;

    public async Task<DashboardStats> GetStatsAsync()
    {
        var stats = await _sql.ExecuteReaderSingleAsync("sp_GetDashboardStats", Map);
        return stats ?? new DashboardStats();
    }

    private static DashboardStats Map(SqlDataReader r) => new()
    {
        TotalEmployees    = Convert.ToInt32(r["TotalEmployees"]),
        ActiveEmployees   = Convert.ToInt32(r["ActiveEmployees"]),
        InactiveEmployees = Convert.ToInt32(r["InactiveEmployees"]),
        TotalDepartments  = Convert.ToInt32(r["TotalDepartments"])
    };
}
