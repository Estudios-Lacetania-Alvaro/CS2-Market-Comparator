import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

/**
 * Component encarregat de gestionar l'accés segur de l'usuari a la plataforma (pantalla de Login).
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Camps de dades del formulari d'accés enllaçats directament a la vista
  email: string = "";
  password: string = ""

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notify: NotificationService
  ){}

  /**
   * Executa l'intent d'inici de sessió a través del servei d'autenticació.
   * Guarda el token de seguretat JWT generat al LocalStorage i redirigeix l'operador al mercat.
   */
  login(){
    const data = {
      email:this.email,
      password:this.password
    }

    this.authService.login(data).subscribe({
      next: (res: any) => {
        // Emmagatzemem el token de Sanctum per a futures peticions protegides
        localStorage.setItem('token', res.token);
        this.notify.show(`Welcome back, ${res.user.name}!`, 'success');
        this.router.navigate(['/market']);
      },
      error: (err) => {
        // En cas de fallada, mostrem una notificació d'error vermella del servei
        this.notify.show(err.error?.message || 'Login failed. Please check your credentials.', 'error');
      }
    });
  }
}
