import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Note: the actual JWT lives in an HttpOnly cookie we cannot read from JS.
 * This guard checks a local "logged in" flag for UI/routing purposes only.
 * The backend's [Authorize] attributes remain the real security boundary -
 * if the cookie is missing/expired/revoked, API calls will return 401
 * regardless of what this guard decides.
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.hasSession()) return true;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.hasSession() && auth.isAdmin()) return true;
  router.navigate(['/dashboard']);
  return false;
};