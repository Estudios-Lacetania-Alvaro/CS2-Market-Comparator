import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

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

  constructor(private authService:AuthService){}

  register(){
    const data = {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation
    }

    this.authService.register(data).subscribe(res => {
      console.log(res)
    })
  }
}
