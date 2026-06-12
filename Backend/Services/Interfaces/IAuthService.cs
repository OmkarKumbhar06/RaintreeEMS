using RaintreeEMS.Models;

namespace RaintreeEMS.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);

        /// <summary>
        /// Validates credentials, issues a JWT, persists it in UserTokens,
        /// and returns the AuthResponse (with Token populated so the controller
        /// can set it as an HttpOnly cookie).
        /// </summary>
        Task<AuthResponse> LoginAsync(LoginRequest request);

        /// <summary>Revokes the given token (logout) .< /summary>
        Task LogoutAsync(string token);

        ///<summary>
        /// Validates a token against the UserTokens table - checks it exists,
        /// is not revoked, and has not expired.
        /// </summary>
        Task<bool> IsTokenValidAsync(string token);
    }
}
