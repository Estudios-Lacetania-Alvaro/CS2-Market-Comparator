import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = "";
  password: string = ""

  constructor(private authService: AuthService){}

  login(){
    const data = {
      email:this.email,
      password:this.password
    }

    this.authService.login(data).subscribe(res =>{
      console.log(res)
    })
  }
}
