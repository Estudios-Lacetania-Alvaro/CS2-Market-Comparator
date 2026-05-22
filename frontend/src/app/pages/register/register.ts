import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

/**
 * Component encarregat de la creació de nous comptes d'usuari (pantalla de Registre).
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  // Dades recollides del formulari de registre d'operador
  name:string = "";
  email:string = "";
  password:string = "";
  password_confirmation:string = "";

  constructor(
    private authService:AuthService,
    private router: Router,
    private notify: NotificationService
  ){}

  /**
   * Executa el mètode de registre de l'usuari amb les dades facilitades.
   * Si es realitza correctament, s'autentica immediatament, es mostra una notificació d'èxit i es navega al mercat.
   */
  register(){
    const data = {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation
    }

    this.authService.register(data).subscribe({
      next: (res: any) => {
        this.notify.show('Account created successfully!', 'success');
        this.router.navigate(['/market']);
      },
      error: (err) => {
        // En cas d'errors de validació del servidor, es mostra un missatge emergent d'error
        this.notify.show(err.error?.message || 'Registration failed. Please try again.', 'error');
      }
    });
  }
}
