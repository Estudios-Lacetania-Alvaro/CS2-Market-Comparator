import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: any = {};
  profileImage: string = "https://ui-avatars.com/api/?name=Usuario&background=4bd5ee&color=0b1116&size=150";

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUser().subscribe({
      next: (data) => {
        if(data) {
          this.user = data;
          this.profileImage = `https://ui-avatars.com/api/?name=${this.user.name}&background=4bd5ee&color=0b1116&size=150`;
        }
      },
      error: (err) => {
        console.error('Error fetching user', err);
        // Si el token no es válido o ha expirado, forzamos login
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
