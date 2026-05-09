import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth';

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

  // Obtenemos el signal del usuario
  user = this.authService.getUser();

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
    });
  }
}
