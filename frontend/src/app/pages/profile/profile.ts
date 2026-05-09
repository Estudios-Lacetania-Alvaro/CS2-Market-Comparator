import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Usamos un objeto local para el formulario para evitar que el effect lo sobrescriba
  user = signal<any>({
    name: '',
    email: '',
    balance: '0.00',
    profile_photo: ''
  });
  profileImage = signal<string>("");

  ngOnInit() {
    // Cargamos los datos iniciales del servicio
    const current = this.authService.getUser()();
    if (current) {
      this.user.set({ ...current });
      if (current.profile_photo) {
        this.profileImage.set(current.profile_photo);
      }
    }
  }

  saveProfile() {
    const userData = this.user();
    const updateData = {
      name: userData.name,
      email: userData.email,
      profile_photo: this.profileImage()
    };

    this.authService.updateUser(updateData).subscribe({
      next: (response: any) => {
        alert('Profile updated successfully');
      },
      error: (err) => {
        console.error('Error updating profile', err);
        // Mostramos el mensaje de error real para saber qué falla (ej: email duplicado)
        const msg = err.error?.message || 'Error updating profile';
        alert(msg);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
