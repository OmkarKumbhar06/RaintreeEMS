import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * 1. Ensures every API request sends/receives cookies (the HttpOnly
 *    RaintreeEMS_AuthToken cookie set by the backend on login).
 * 2. If the API returns 401 (cookie missing/expired/revoked), clears
 *    local session flags and redirects to /login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
