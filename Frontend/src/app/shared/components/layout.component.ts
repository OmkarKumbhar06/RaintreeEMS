import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-icon"><i class="fas fa-building"></i></div>
          <div>
            <div class="brand-name">Raintree EMS</div>
            <div class="brand-sub">Management System</div>
          </div>
        </div>

        <nav class="nav">
          <a routerLink="/dashboard"   routerLinkActive="active" class="nav-link">
            <i class="fas fa-tachometer-alt"></i><span>Dashboard</span>
          </a>
          <a routerLink="/departments" routerLinkActive="active" class="nav-link">
            <i class="fas fa-sitemap"></i><span>Departments</span>
          </a>
          <a routerLink="/employees"   routerLinkActive="active" class="nav-link">
            <i class="fas fa-users"></i><span>Employees</span>
          </a>
          <a routerLink="/reports"     routerLinkActive="active" class="nav-link">
            <i class="fas fa-chart-bar"></i><span>Reports</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-row">
            <div class="avatar"><i class="fas fa-user-circle"></i></div>
            <div class="user-meta">
              <div class="user-name">{{ auth.getFullName() }}</div>
              <span class="badge" [class]="auth.isAdmin() ? 'badge-admin' : 'badge-user'">
                {{ auth.getRole() }}
              </span>
            </div>
          </div>
          <button class="btn btn-outline btn-sm logout-btn" (click)="auth.logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-w); background: var(--sidebar-bg); color: #fff;
      display: flex; flex-direction: column; position: fixed;
      height: 100vh; z-index: 100; overflow-y: auto;
    }
    .brand {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 18px; border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .brand-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg,#3b82f6,#1d4ed8);
      display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
    }
    .brand-name { font-size: 15px; font-weight: 700; }
    .brand-sub  { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 1px; }

    .nav { flex: 1; padding: 12px 10px; }
    .nav-link {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 12px; border-radius: 8px;
      color: rgba(255,255,255,.6); text-decoration: none;
      font-size: 14px; font-weight: 500; transition: all .15s;
      margin-bottom: 3px;
    }
    .nav-link i { width: 18px; text-align: center; font-size: 15px; }
    .nav-link:hover { background: rgba(255,255,255,.08); color: #fff; }
    .nav-link.active { background: rgba(59,130,246,.25); color: #93c5fd; }

    .sidebar-footer {
      padding: 14px 12px; border-top: 1px solid rgba(255,255,255,.08);
    }
    .user-row   { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .avatar     { font-size: 30px; color: rgba(255,255,255,.5); flex-shrink: 0; }
    .user-name  { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .logout-btn { width: 100%; justify-content: center; background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.15); color: rgba(255,255,255,.75); }
    .logout-btn:hover { background: rgba(255,255,255,.12); color: #fff; }

    /* Main content */
    .main { margin-left: var(--sidebar-w); flex: 1; padding: 28px; min-height: 100vh; }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
}
