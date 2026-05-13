import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name:string = "";
  email:string = "";
  password:string = "";
  password_confirmation:string = "";

  constructor(
    private authService:AuthService,
    private router: Router,
    private notify: NotificationService
  ){}

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
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.notify.show(err.error?.message || 'Registration failed. Please try again.', 'error');
      }
    });
  }
}
