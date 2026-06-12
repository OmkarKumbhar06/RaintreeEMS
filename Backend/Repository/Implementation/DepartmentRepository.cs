using Microsoft.Data.SqlClient;
using RaintreeEMS.Helpers;
using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;

namespace RaintreeEMS.Repository.Implementation;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly MsSqlHelper _sql;
    public DepartmentRepository(MsSqlHelper sql) => _sql = sql;

    public async Task<List<Department>> GetAllAsync()
        => await _sql.ExecuteReaderListAsync("sp_GetAllDepartments", Map);

    public async Task<Department?> GetByIdAsync(int id)
        => await _sql.ExecuteReaderSingleAsync(
            "sp_GetDepartmentById",
            Map,
            new Dictionary<string, object?> { ["@DepartmentId"] = id });

    public async Task<int> CreateAsync(Department department)
    {
        return await _sql.ExecuteReaderSingleAsync(
            "sp_CreateDepartment",
            r => Convert.ToInt32(r["DepartmentId"]),
            new Dictionary<string, object?>
            {
                ["@DepartmentName"] = department.DepartmentName,
                ["@Description"]    = department.Description,
                ["@Status"]         = department.Status
            });
    }

    public async Task UpdateAsync(Department department)
    {
        await _sql.ExecuteNonQueryAsync(
            "sp_UpdateDepartment",
            new Dictionary<string, object?>
            {
                ["@DepartmentId"]   = department.DepartmentId,
                ["@DepartmentName"] = department.DepartmentName,
                ["@Description"]    = department.Description,
                ["@Status"]         = department.Status
            });
    }

    public async Task<(int Result, string Message)> DeleteAsync(int id)
    {
        var row = await _sql.ExecuteReaderSingleAsync(
            "sp_DeleteDepartment",
            r => (Result: Convert.ToInt32(r["Result"]), Message: r["Message"].ToString()!),
            new Dictionary<string, object?> { ["@DepartmentId"] = id });

        return row == default ? (0, "Delete failed") : row;
    }

    public async Task<bool> HasEmployeesAsync(int departmentId)
    {
        var count = await _sql.ExecuteScalarSqlAsync(
            "SELECT COUNT(1) FROM Employees WHERE DepartmentId = @DepartmentId",
            new Dictionary<string, object?> { ["@DepartmentId"] = departmentId });

        return count > 0;
    }

    private static Department Map(SqlDataReader r) => new()
    {
        DepartmentId   = Convert.ToInt32(r["DepartmentId"]),
        DepartmentName = r["DepartmentName"].ToString()!,
        Description    = r["Description"] == DBNull.Value ? null : r["Description"].ToString(),
        Status         = r["Status"].ToString()!,
        CreatedAt      = Convert.ToDateTime(r["CreatedAt"]),
        UpdatedAt      = r["UpdatedAt"] == DBNull.Value ? null : Convert.ToDateTime(r["UpdatedAt"])
    };
}
