namespace RaintreeEMS.Models;


public class User
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}

public class UserToken
{
    public int TokenId { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class Employee
{
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MobileNo { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}


// =====================================================================
// REQUEST DTOs
// =====================================================================

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class DepartmentRequest
{
    public string DepartmentName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "Active";
}

public class EmployeeRequest
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string Designation { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MobileNo { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public string Status { get; set; } = "Active";
}


// =====================================================================
// RESPONSE DTOs
// =====================================================================

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }

    /// <summary>
    /// Only populated internally so AuthService can hand the raw token
    /// to the controller for setting the HttpOnly cookie.
    /// Never serialize this to the client in the JSON body.
    /// </summary>
    public string? Token { get; set; }
    public DateTime? TokenExpiresAt { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
}

public class DashboardStats
{
    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }
    public int InactiveEmployees { get; set; }
    public int TotalDepartments { get; set; }
}
