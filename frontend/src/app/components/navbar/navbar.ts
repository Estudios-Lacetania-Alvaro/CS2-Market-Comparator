import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  user: any = null;
  private routerSub: Subscription;

  constructor(private router: Router, private authService: AuthService) {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isLoggedIn && !this.user) {
        this.fetchUser();
      } else if (!this.isLoggedIn) {
        this.user = null;
      }
    });
  }

  ngOnInit() {
    if (this.isLoggedIn && !this.user) {
      this.fetchUser();
    }
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  fetchUser() {
    this.authService.getUser().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error fetching user for navbar', err);
      }
    });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.user = null;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error', err);
        localStorage.removeItem('token');
        this.user = null;
        this.router.navigate(['/login']);
      }
    });
  }
}
