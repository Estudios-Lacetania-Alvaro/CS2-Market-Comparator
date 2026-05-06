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
  profileImage: string = "";

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUser().subscribe({
      next: (data: any) => {
        if(data) {
          // Extracción correcta del usuario
          this.user = data.user ? data.user : data;
          
          // Usamos la foto que venga de la base de datos
          if (this.user?.profile_photo) {
            this.profileImage = this.user.profile_photo;
          }
        }
      },
      error: (err) => {
        console.error('Error fetching user', err);
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error', err);
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
