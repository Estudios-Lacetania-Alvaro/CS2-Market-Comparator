import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = "";
  password: string = ""

  constructor(private authService: AuthService, private router: Router){}

  login(){
    const data = {
      email:this.email,
      password:this.password
    }

    this.authService.login(data).subscribe((res: any) => {
      localStorage.setItem('token', res.token);
      this.router.navigate(['/profile']);
    })
  }
}
