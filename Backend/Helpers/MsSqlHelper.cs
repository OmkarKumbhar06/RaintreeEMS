using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace RaintreeEMS.Helpers;

/// <summary>
/// Central helper for executing SQL Server stored procedures.
/// All Repository classes use this helper instead of touching
/// SqlConnection/SqlCommand directly, keeping data-access code
/// short and consistent. Uses plain ADO.NET (Microsoft.Data.SqlClient) -
/// no Dapper, no ORM.
/// </summary>
public class MsSqlHelper
{
    private readonly string _connectionString;

    public MsSqlHelper(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string is not configured.");
    }

    /// <summary>Creates a new (closed) SqlConnection using the configured connection string.</summary>
    public SqlConnection CreateConnection() => new SqlConnection(_connectionString);

    /// <summary>
    /// Executes a stored procedure that returns a result set, mapping each row
    /// via <paramref name="map"/>. Returns an empty list if no rows are returned.
    /// </summary>
    public async Task<List<T>> ExecuteReaderListAsync<T>(
        string storedProcedure,
        Func<SqlDataReader, T> map,
        Dictionary<string, object?>? parameters = null)
    {
        var results = new List<T>();
        using var conn = CreateConnection();
        await conn.OpenAsync();
        using var cmd = CreateCommand(storedProcedure, conn, parameters);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            results.Add(map(reader));
        return results;
    }

    /// <summary>
    /// Executes a stored procedure expected to return a single row, mapping it
    /// via <paramref name="map"/>. Returns default(T) if no row is returned.
    /// </summary>
    public async Task<T?> ExecuteReaderSingleAsync<T>(
        string storedProcedure,
        Func<SqlDataReader, T> map,
        Dictionary<string, object?>? parameters = null)
    {
        using var conn = CreateConnection();
        await conn.OpenAsync();
        using var cmd = CreateCommand(storedProcedure, conn, parameters);
        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
            return map(reader);
        return default;
    }

    /// <summary>
    /// Executes a stored procedure that does not return a result set
    /// (e.g. UPDATE / DELETE without a SELECT). Returns affected row count.
    /// </summary>
    public async Task<int> ExecuteNonQueryAsync(
        string storedProcedure,
        Dictionary<string, object?>? parameters = null)
    {
        using var conn = CreateConnection();
        await conn.OpenAsync();
        using var cmd = CreateCommand(storedProcedure, conn, parameters);
        return await cmd.ExecuteNonQueryAsync();
    }

    /// <summary>
    /// Executes a scalar query (raw SQL, not a stored procedure) - used for
    /// simple existence/count checks where a dedicated SP is overkill.
    /// </summary>
    public async Task<int> ExecuteScalarSqlAsync(string sql, Dictionary<string, object?>? parameters = null)
    {
        using var conn = CreateConnection();
        await conn.OpenAsync();
        using var cmd = new SqlCommand(sql, conn) { CommandType = CommandType.Text };
        AddParameters(cmd, parameters);
        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    private static SqlCommand CreateCommand(string storedProcedure, SqlConnection conn, Dictionary<string, object?>? parameters)
    {
        var cmd = new SqlCommand(storedProcedure, conn) { CommandType = CommandType.StoredProcedure };
        AddParameters(cmd, parameters);
        return cmd;
    }

    private static void AddParameters(SqlCommand cmd, Dictionary<string, object?>? parameters)
    {
        if (parameters == null) return;
        foreach (var (key, value) in parameters)
            cmd.Parameters.AddWithValue(key, value ?? DBNull.Value);
    }
}
