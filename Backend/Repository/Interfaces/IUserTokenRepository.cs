using RaintreeEMS.Models;

namespace RaintreeEMS.Repository.Interfaces;
public interface IUserTokenRepository
{
    Task<int> SaveTokenAsync(int userId, string token, DateTime expiresAt);
    Task<UserToken?> GetTokenAsync(string token);
    Task RevokeTokenAsync(string token);
    Task RevokeAllTokensForUserAsync(int userId);
}
