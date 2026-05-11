import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { Home } from './pages/home/home';
import { Market } from './pages/market/market';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login },  
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'market', component: Market },
  { path: 'inventory', loadComponent: () => import('./pages/inventory/inventory').then(m => m.Inventory), canActivate: [authGuard] },
  { path: 'charts', loadComponent: () => import('./pages/charts/charts').then(m => m.Charts), canActivate: [authGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
