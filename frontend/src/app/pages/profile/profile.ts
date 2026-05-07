import { Component, OnInit, signal, effect } from '@angular/core';
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
  // Usamos signals para que Angular detecte los cambios
  user = signal<any>({
    name: '',
    email: '',
    balance: '0.00',
    profile_photo: ''
  });
  profileImage = signal<string>("");

  constructor(private authService: AuthService, private router: Router) {
    // Sincronizamos con el signal global de AuthService
    effect(() => {
      const globalUser = this.authService.getUser()();
      if (globalUser) {
        this.user.set({ ...globalUser });
        if (globalUser.profile_photo) {
          this.profileImage.set(globalUser.profile_photo);
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {}

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
        alert('Error updating profile');
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Al actualizar el signal, la vista se refresca instantáneamente
        this.profileImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
