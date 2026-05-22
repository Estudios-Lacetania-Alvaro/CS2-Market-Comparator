import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth';
import { CurrencyService } from '../../services/currency.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  public router = inject(Router);
  public currencyService = inject(CurrencyService);

  // Obtenim el signal de l'usuari
  user = this.authService.getUser();
  isMobileMenuOpen = signal<boolean>(false);

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}

  get isLoggedIn(): boolean {
    return !!this.user();
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
      this.isMobileMenuOpen.set(false);
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
