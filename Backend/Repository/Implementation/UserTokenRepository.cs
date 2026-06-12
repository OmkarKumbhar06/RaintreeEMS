using Microsoft.Data.SqlClient;
using RaintreeEMS.Helpers;
using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;

namespace RaintreeEMS.Repository.Implementation;

public class UserTokenRepository : IUserTokenRepository
{
    private readonly MsSqlHelper _sql;
    public UserTokenRepository(MsSqlHelper sql) => _sql = sql;

    public async Task<int> SaveTokenAsync(int userId, string token, DateTime expiresAt)
    {
        var result = await _sql.ExecuteReaderSingleAsync(
            "sp_SaveUserToken",
            r => Convert.ToInt32(r["TokenId"]),
            new Dictionary<string, object?>
            {
                ["@UserId"]    = userId,
                ["@Token"]     = token,
                ["@ExpiresAt"] = expiresAt
            });

        return result;
    }

    public async Task<UserToken?> GetTokenAsync(string token)
    {
        return await _sql.ExecuteReaderSingleAsync(
            "sp_GetUserToken",
            Map,
            new Dictionary<string, object?> { ["@Token"] = token });
    }

    public async Task RevokeTokenAsync(string token)
    {
        await _sql.ExecuteReaderSingleAsync(
            "sp_RevokeUserToken",
            r => Convert.ToInt32(r["Result"]),
            new Dictionary<string, object?> { ["@Token"] = token });
    }

    public async Task RevokeAllTokensForUserAsync(int userId)
    {
        await _sql.ExecuteReaderSingleAsync(
            "sp_RevokeAllUserTokens",
            r => Convert.ToInt32(r["Result"]),
            new Dictionary<string, object?> { ["@UserId"] = userId });
    }

    private static UserToken Map(SqlDataReader r) => new()
    {
        TokenId   = Convert.ToInt32(r["TokenId"]),
        UserId    = Convert.ToInt32(r["UserId"]),
        Token     = r["Token"].ToString()!,
        ExpiresAt = Convert.ToDateTime(r["ExpiresAt"]),
        IsRevoked = Convert.ToBoolean(r["IsRevoked"]),
        CreatedAt = Convert.ToDateTime(r["CreatedAt"])
    };
}
