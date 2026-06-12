using RaintreeEMS.Helpers;
using RaintreeEMS.Models;
using RaintreeEMS.Repository.Interfaces;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Services.Implementation;

/// <summary>
/// Business logic for authentication: password hashing, validation,
/// JWT issuance, and persisting/validating/revoking tokens via UserTokens table.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly IUserTokenRepository _tokenRepo;
    private readonly JwtHelper _jwt;

    public AuthService(IUserRepository userRepo, IUserTokenRepository tokenRepo, JwtHelper jwt)
    {
        _userRepo = userRepo;
        _tokenRepo = tokenRepo;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return new AuthResponse { Success = false, Message = "FullName, Email and Password are required" };
        }

        var hash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var (result, message) = await _userRepo.RegisterAsync(request.FullName, request.Email, hash, request.Role);

        return new AuthResponse { Success = result > 0, Message = message };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepo.GetByEmailAsync(request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return new AuthResponse { Success = false, Message = "Invalid email or password" };

        var (token, expiresAt) = _jwt.GenerateToken(user.UserId, user.Email, user.Role);

        // Persist the bearer token so it can be validated / revoked server-side
        await _tokenRepo.SaveTokenAsync(user.UserId, token, expiresAt);

        return new AuthResponse
        {
            Success        = true,
            Message        = "Login successful",
            Role           = user.Role,
            FullName       = user.FullName,
            Email          = user.Email,
            Token          = token,          // controller uses this to set the HttpOnly cookie
            TokenExpiresAt = expiresAt
        };
    }

    public async Task LogoutAsync(string token)
    {
        if (!string.IsNullOrWhiteSpace(token))
            await _tokenRepo.RevokeTokenAsync(token);
    }

    public async Task<bool> IsTokenValidAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return false;

        var record = await _tokenRepo.GetTokenAsync(token);
        if (record == null) return false;
        if (record.IsRevoked) return false;
        if (record.ExpiresAt <= DateTime.UtcNow) return false;

        return true;
    }
}
