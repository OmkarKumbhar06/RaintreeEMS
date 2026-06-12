using Microsoft.Data.SqlClient;
using RaintreeEMS.Helpers;
using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;

namespace RaintreeEMS.Repository.Implementation;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly MsSqlHelper _sql;
    public EmployeeRepository(MsSqlHelper sql) => _sql = sql;

    public async Task<List<Employee>> GetAllAsync()
        => await _sql.ExecuteReaderListAsync("sp_GetAllEmployees", Map);

    public async Task<Employee?> GetByIdAsync(int id)
        => await _sql.ExecuteReaderSingleAsync(
            "sp_GetEmployeeById",
            Map,
            new Dictionary<string, object?> { ["@EmployeeId"] = id });

    public async Task<(int EmployeeId, string Message)> CreateAsync(Employee e)
    {
        var row = await _sql.ExecuteReaderSingleAsync(
            "sp_CreateEmployee",
            r => (EmployeeId: Convert.ToInt32(r["EmployeeId"]), Message: r["Message"].ToString()!),
            BuildParams(e));

        return row == default ? (0, "Create failed") : row;
    }

    public async Task UpdateAsync(Employee e)
    {
        var parameters = BuildParams(e);
        parameters["@EmployeeId"] = e.EmployeeId;
        parameters["@EmployeeCode"] = e.EmployeeCode;
        await _sql.ExecuteNonQueryAsync("sp_UpdateEmployee", parameters);
    }

    public async Task DeleteAsync(int id)
    {
        await _sql.ExecuteReaderSingleAsync(
            "sp_DeleteEmployee",
            r => Convert.ToInt32(r["Result"]),
            new Dictionary<string, object?> { ["@EmployeeId"] = id });
    }

    public async Task<List<Employee>> GetByStatusAsync(string status)
        => await _sql.ExecuteReaderListAsync(
            "sp_GetEmployeesByStatus",
            MapReportRow,
            new Dictionary<string, object?> { ["@Status"] = status });

    public async Task<List<Employee>> GetEmployeeReportByDepartmentAsync()
        => await _sql.ExecuteReaderListAsync("sp_GetEmployeeReportByDepartment", MapReportRow);

    private static Dictionary<string, object?> BuildParams(Employee e) => new()
    {
       // ["@EmployeeCode"] = e.EmployeeCode,
        ["@EmployeeName"] = e.EmployeeName,
        ["@DepartmentId"] = e.DepartmentId,
        ["@Designation"]  = e.Designation,
        ["@Email"]        = e.Email,
        ["@MobileNo"]     = e.MobileNo,
        ["@JoiningDate"]  = e.JoiningDate.Date,
        ["@Status"]       = e.Status
    };

    /// <summary>Maps the full row returned by sp_GetAllEmployees / sp_GetEmployeeById (includes EmployeeId, CreatedAt, UpdatedAt).</summary>
    private static Employee Map(SqlDataReader r) => new()
    {
        EmployeeId     = Convert.ToInt32(r["EmployeeId"]),
        EmployeeCode   = r["EmployeeCode"].ToString()!,
        EmployeeName   = r["EmployeeName"].ToString()!,
        DepartmentId   = Convert.ToInt32(r["DepartmentId"]),
        DepartmentName = r["DepartmentName"].ToString()!,
        Designation    = r["Designation"].ToString()!,
        Email          = r["Email"].ToString()!,
        MobileNo       = r["MobileNo"].ToString()!,
        JoiningDate    = Convert.ToDateTime(r["JoiningDate"]),
        Status         = r["Status"].ToString()!,
        CreatedAt      = Convert.ToDateTime(r["CreatedAt"]),
        UpdatedAt      = r["UpdatedAt"] == DBNull.Value ? null : Convert.ToDateTime(r["UpdatedAt"])
    };

    /// <summary>Maps the slimmer row returned by report/status SPs (no EmployeeId/CreatedAt/UpdatedAt for the department-report SP).</summary>
    private static Employee MapReportRow(SqlDataReader r)
    {
        var emp = new Employee
        {
            DepartmentName = r["DepartmentName"].ToString()!,
            EmployeeCode   = r["EmployeeCode"].ToString()!,
            EmployeeName   = r["EmployeeName"].ToString()!,
            Designation    = r["Designation"].ToString()!,
            Email          = r["Email"].ToString()!,
            MobileNo       = r["MobileNo"].ToString()!,
            JoiningDate    = DateTime.Parse(r["JoiningDate"].ToString()!),
            Status         = r["Status"].ToString()!
        };

        // sp_GetEmployeesByStatus also returns EmployeeId
        if (HasColumn(r, "EmployeeId"))
            emp.EmployeeId = Convert.ToInt32(r["EmployeeId"]);

        return emp;
    }

    private static bool HasColumn(SqlDataReader r, string columnName)
    {
        for (int i = 0; i < r.FieldCount; i++)
            if (r.GetName(i).Equals(columnName, StringComparison.OrdinalIgnoreCase))
                return true;
        return false;
    }
}
