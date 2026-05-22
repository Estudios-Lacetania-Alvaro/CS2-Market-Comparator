import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifiquem si hi ha un usuari al signal o si la sessió és vàlida
  if (authService.getUser()()) {
    return true;
  }

  // Si no, redirigim a login
  return router.navigate(['/login']);
};
