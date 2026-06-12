using System.Net;
using System.Text.Json;

namespace RaintreeEMS.Middleware;

/// <summary>
/// Global error handler. Catches any unhandled exception thrown by
/// controllers/services/repositories and returns a consistent JSON
/// error response instead of a raw stack trace.
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                success = false,
                message = "An unexpected error occurred. Please try again later.",
                // Detail is included to aid local debugging; remove in production if desired.
                detail = ex.Message
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}

/// <summary>Extension method for clean registration in Program.cs.</summary>
public static class ExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionMiddleware(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionMiddleware>();
}
