import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="card-wrap">
        <!-- Logo -->
        <div class="logo-area">
          <div class="logo-icon"><i class="fas fa-building"></i></div>
          <h1 class="logo-title">Raintree EMS</h1>
          <p class="logo-sub">Employee Management System</p>
        </div>

        @if (errorMsg) {
          <div class="alert alert-danger"><i class="fas fa-circle-exclamation"></i>{{ errorMsg }}</div>
        }

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-icon-wrap">
              <i class="fas fa-envelope input-icon"></i>
              <input id="email" class="form-control" type="email"
                     [(ngModel)]="email" name="email"
                     placeholder="you@company.com" required autocomplete="email">
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-icon-wrap">
              <i class="fas fa-lock input-icon"></i>
              <input id="password" class="form-control"
                     [type]="showPwd ? 'text' : 'password'"
                     [(ngModel)]="password" name="password"
                     placeholder="••••••••" required autocomplete="current-password">
              <button type="button" class="eye-btn" (click)="showPwd = !showPwd">
                <i class="fas" [class.fa-eye]="!showPwd" [class.fa-eye-slash]="showPwd"></i>
              </button>
            </div>
          </div>

          <button class="btn btn-primary submit-btn" type="submit" [disabled]="loading">
            @if (loading) { <span class="spinner"></span> Signing in… }
            @else          { <i class="fas fa-sign-in-alt"></i> Sign In }
          </button>
        </form>

        <div class="demo-box">
          <p class="demo-title"><i class="fas fa-info-circle"></i> Demo Credentials</p>
          <div class="demo-row">
            <span class="badge badge-admin">Admin</span>
            <span>admin&#64;raintree.com</span>
            <code>Admin&#64;123</code>
          </div>
          <div class="demo-row">
            <span class="badge badge-user">User</span>
            <span>user&#64;raintree.com</span>
            <code>User&#64;123</code>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      padding: 20px;
    }
    .card-wrap {
      background: #fff; border-radius: 16px; padding: 40px;
      width: 100%; max-width: 420px; box-shadow: 0 30px 80px rgba(0,0,0,.4);
    }
    .logo-area    { text-align: center; margin-bottom: 30px; }
    .logo-icon    { width: 64px; height: 64px; background: linear-gradient(135deg,#3b82f6,#1d4ed8); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin-bottom: 14px; }
    .logo-title   { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .logo-sub     { color: var(--text-muted); font-size: 13px; }
    .input-icon-wrap { position: relative; }
    .input-icon   { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 13px; pointer-events: none; }
    .input-icon-wrap .form-control { padding-left: 35px; padding-right: 38px; }
    .eye-btn      { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; }
    .eye-btn:hover { color: var(--text); }
    .submit-btn   { width: 100%; justify-content: center; padding: 11px; font-size: 15px; margin-top: 4px; }
    .demo-box     { margin-top: 22px; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border); }
    .demo-title   { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }
    .demo-row     { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 5px; flex-wrap: wrap; }
    .demo-row:last-child { margin-bottom: 0; }
    code          { background: #e2e8f0; border-radius: 4px; padding: 1px 6px; font-size: 11px; }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email = ''; password = ''; showPwd = false; loading = false; errorMsg = '';

  onLogin() {
    if (!this.email || !this.password) { this.errorMsg = 'Email and password are required'; return; }
    this.loading = true; this.errorMsg = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) this.router.navigate(['/dashboard']);
        else this.errorMsg = res.message;
      },
      error: () => { this.loading = false; this.errorMsg = 'Cannot connect to server. Is the API running?'; }
    });
  }
}
