using Microsoft.Data.SqlClient;
using RaintreeEMS.Helpers;
using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;

namespace RaintreeEMS.Repository.Implementation;

public class UserRepository : IUserRepository
{
    private readonly MsSqlHelper _sql;
    public UserRepository(MsSqlHelper sql) => _sql = sql;

    public async Task<(int Result, string Message)> RegisterAsync(string fullName, string email, string passwordHash, string role)
    {
        var row = await _sql.ExecuteReaderSingleAsync(
            "sp_RegisterUser",
            r => (Result: Convert.ToInt32(r["Result"]), Message: r["Message"].ToString()!),
            new Dictionary<string, object?>
            {
                ["@FullName"]     = fullName,
                ["@Email"]        = email,
                ["@PasswordHash"] = passwordHash,
                ["@Role"]         = role
            });

        return row == default ? (0, "Registration failed") : row;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _sql.ExecuteReaderSingleAsync(
            "sp_GetUserByEmail",
            Map,
            new Dictionary<string, object?> { ["@Email"] = email });
    }

    public async Task<User?> GetByIdAsync(int userId)
    {
        return await _sql.ExecuteReaderSingleAsync(
            "sp_GetUserById",
            Map,
            new Dictionary<string, object?> { ["@UserId"] = userId });
    }

    private static User Map(SqlDataReader r) => new()
    {
        UserId       = Convert.ToInt32(r["UserId"]),
        FullName     = r["FullName"].ToString()!,
        Email        = r["Email"].ToString()!,
        PasswordHash = r["PasswordHash"].ToString()!,
        Role         = r["Role"].ToString()!,
        IsActive     = Convert.ToBoolean(r["IsActive"])
    };
}
