import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'departments', loadComponent: () => import('./features/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'employees',   loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'reports',     loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
