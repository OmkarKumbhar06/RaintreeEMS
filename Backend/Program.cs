using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RaintreeEMS.Helpers;
using RaintreeEMS.Middleware;
using RaintreeEMS.Repository.Implementation;
using RaintreeEMS.Repository.Interfaces;
using RaintreeEMS.Services.Implementation;
using RaintreeEMS.Services.Interfaces;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

const string CookieName = "RaintreeEMS_AuthToken";

// -------------------------------------------------------------------
// SQL Helper (ADO.NET wrapper - no Dapper, no EF)
// -------------------------------------------------------------------
builder.Services.AddSingleton<MsSqlHelper>();

// -------------------------------------------------------------------
// Repositories (data access layer - stored procedures via MsSqlHelper)
// -------------------------------------------------------------------
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserTokenRepository, UserTokenRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

// -------------------------------------------------------------------
// Services (business logic layer)
// -------------------------------------------------------------------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddSingleton<JwtHelper>();

// -------------------------------------------------------------------
// JWT Authentication - reads the token from the HttpOnly cookie
// -------------------------------------------------------------------
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtSettings["Issuer"],
        ValidAudience            = jwtSettings["Audience"],
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };

    // Pull the JWT out of the HttpOnly cookie instead of the Authorization header
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue(CookieName, out var token) && !string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        },

        // Reject the token if it has been revoked / removed from UserTokens
        OnTokenValidated = async context =>
        {
            var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();

            if (context.HttpContext.Request.Cookies.TryGetValue(CookieName, out var rawToken)
                && !string.IsNullOrEmpty(rawToken))
            {
                var isValid = await authService.IsTokenValidAsync(rawToken);
                if (!isValid)
                {
                    context.Fail("Token has been revoked or is no longer valid.");
                }
            }
            else
            {
                context.Fail("No auth cookie present.");
            }
        }
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// -------------------------------------------------------------------
// Swagger
// -------------------------------------------------------------------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RaintreeEMS API", Version = "v1" });
    c.AddSecurityDefinition("cookieAuth", new OpenApiSecurityScheme
    {
        Description = "JWT is stored in an HttpOnly cookie set automatically by /api/auth/login. " +
                      "Swagger's 'Try it out' will send the cookie automatically once you're logged in via the browser.",
        Name = "RaintreeEMS_AuthToken",
        In   = ParameterLocation.Cookie,
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "cookieAuth" } },
            Array.Empty<string>()
        }
    });
});

// -------------------------------------------------------------------
// CORS - must allow credentials (cookies) from the Angular app
// -------------------------------------------------------------------
var frontendOrigin = builder.Configuration["CookieSettings:FrontendOrigin"] ?? "http://localhost:4200";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins(frontendOrigin)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());   // required so the browser sends/receives the auth cookie
});

var app = builder.Build();

// -------------------------------------------------------------------
// Middleware pipeline
// -------------------------------------------------------------------
app.UseGlobalExceptionMiddleware();

//app.UseSwagger();
//app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "RaintreeEMS API v1"));

app.UseSwagger();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "RaintreeEMS API v1");
    options.RoutePrefix = string.Empty;
});

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
//app.MapGet("/", () => "RaintreeEMS API Running");
app.Run();
