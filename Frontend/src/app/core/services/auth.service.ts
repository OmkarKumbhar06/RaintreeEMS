import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../shared/models/models';

const API = 'https://localhost:57447/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  // We can no longer read the auth cookie (HttpOnly), so login state
  // is tracked via localStorage flags set after a successful login.
  private _loggedIn$ = new BehaviorSubject<boolean>(this.hasSession());
  loggedIn$ = this._loggedIn$.asObservable();

  login(req: LoginRequest): Observable<AuthResponse> {
    // withCredentials: true -> browser stores the Set-Cookie from the API response
    return this.http.post<AuthResponse>(`${API}/auth/login`, req, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success) {
          localStorage.setItem('role',     res.role!);
          localStorage.setItem('fullName', res.fullName!);
          localStorage.setItem('email',    res.email!);
          this._loggedIn$.next(true);
        }
      })
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, req, { withCredentials: true });
  }

  logout(): void {
    // Tell the backend to revoke the token row + clear the cookie
    this.http.post(`${API}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout() // clear local state even if the call fails
    });
  }

  private finishLogout(): void {
    localStorage.clear();
    this._loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getRole():     string | null { return localStorage.getItem('role'); }
  getFullName(): string        { return localStorage.getItem('fullName') ?? 'User'; }
  isAdmin():     boolean       { return this.getRole() === 'Admin'; }
  hasSession():  boolean       { return !!localStorage.getItem('role'); }
}
