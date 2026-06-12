export interface LoginRequest    { email: string; password: string; }
export interface RegisterRequest { fullName: string; email: string; password: string; role: string; }
export interface AuthResponse    { success: boolean; message: string; token?: string; role?: string; fullName?: string; email?: string; }

export interface Department {
  departmentId: number; departmentName: string; description?: string;
  status: string; createdAt?: string; updatedAt?: string;
}

export interface Employee {
  employeeId: number; employeeCode: string; employeeName: string;
  departmentId: number; departmentName: string; designation: string;
  email: string; mobileNo: string; joiningDate: string;
  status: string; createdAt?: string; updatedAt?: string;
}

export interface DashboardStats {
  totalEmployees: number; activeEmployees: number;
  inactiveEmployees: number; totalDepartments: number;
}

export interface ApiResponse<T> { success: boolean; message: string; data?: T; }
