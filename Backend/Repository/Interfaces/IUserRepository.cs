using RaintreeEMS.Models;

namespace RaintreeEMS.Repository.Interfaces;

public interface IUserRepository
{
    Task<(int Result, string Message)> RegisterAsync(string fullName, string email, string passwordHash, string role);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(int userId);
}
