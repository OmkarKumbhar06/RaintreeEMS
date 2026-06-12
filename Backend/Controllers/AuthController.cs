using Microsoft.AspNetCore.Mvc;
using RaintreeEMS.Models;
using RaintreeEMS.Services.Interfaces;

namespace RaintreeEMS.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _config;

    private const string CookieName = "RaintreeEMS_AuthToken";

    public AuthController(IAuthService authService, IConfiguration config)
    {
        _authService = authService;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);

            if (!result.Success || string.IsNullOrEmpty(result.Token))
                return Unauthorized(new
                {
                    success = false,
                    message = result.Message
                });

            Response.Cookies.Append(CookieName, result.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = result.TokenExpiresAt
            });

            return Ok(new AuthResponse
            {
                Success = result.Success,
                Message = result.Message,
                Role = result.Role,
                FullName = result.FullName,
                Email = result.Email
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Message = ex.Message,
                StackTrace = ex.StackTrace
            });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (Request.Cookies.TryGetValue(CookieName, out var token) && !string.IsNullOrEmpty(token))
        {
            await _authService.LogoutAsync(token);
        }

        Response.Cookies.Delete(CookieName);
        return Ok(new { success = true, message = "Logged out successfully" });
    }
}