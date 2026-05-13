import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = "";
  password: string = ""

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notify: NotificationService
  ){}

  login(){
    const data = {
      email:this.email,
      password:this.password
    }

    this.authService.login(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.notify.show(`Welcome back, ${res.user.name}!`, 'success');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.notify.show(err.error?.message || 'Login failed. Please check your credentials.', 'error');
      }
    });
  }
}
