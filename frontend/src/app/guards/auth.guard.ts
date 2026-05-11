import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si hay un usuario en el signal o si la sesión es válida
  if (authService.getUser()()) {
    return true;
  }

  // Si no, redirigimos a login
  return router.navigate(['/login']);
};
