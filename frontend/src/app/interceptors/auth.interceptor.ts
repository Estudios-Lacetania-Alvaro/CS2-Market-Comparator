import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor HTTP global que injecta el token d'autorització Sanctum (Bearer Token)
 * en cada petició que es fa al backend, si aquest és present al LocalStorage.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Clonem la petició original i hi afegim la capçalera d'autorització requerida pel middleware de Laravel
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  // Si no hi ha cap token actiu, continuem amb la petició original sense modificar
  return next(req);
};
