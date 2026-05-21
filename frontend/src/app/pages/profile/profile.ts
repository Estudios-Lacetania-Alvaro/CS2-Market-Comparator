import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';

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
  private notify = inject(NotificationService);

  // Utilitzem un objecte local per al formulari per evitar que l'effect el sobrescrigui
  user = signal<any>({
    name: '',
    email: '',
    balance: '0.00',
    profile_photo: ''
  });
  profileImage = signal<string>("");
  currencyService = inject(CurrencyService);

  ngOnInit() {
    // Carreguem les dades inicials del servei
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
        this.notify.show('Profile updated successfully!', 'success');
      },
      error: (err) => {
        const msg = err.error?.message || 'Error updating profile';
        this.notify.show(msg, 'error');
      }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  changeCurrency(code: CurrencyCode) {
    this.currencyService.setCurrency(code);
    this.notify.show(`Currency changed to ${code}`, 'success');
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
