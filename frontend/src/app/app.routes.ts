import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { Home } from './pages/home/home';
import { Market } from './pages/market/market';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login },  
  { path: 'register', component: Register },
  { path: 'profile', component: Profile },
  { path: 'market', component: Market },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
