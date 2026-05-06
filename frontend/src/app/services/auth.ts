import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'
  
  // Usamos un Signal para el estado del usuario (Moderno / Zoneless)
  private currentUserSignal = signal<any>(null);
  public currentUser = computed(() => this.currentUserSignal());

  constructor(private http:HttpClient) {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      this.currentUserSignal.set(JSON.parse(cachedUser));
    }
    
    if (localStorage.getItem('token')) {
      this.fetchUser().subscribe();
    }
  }

  register(data:any){
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.user) {
          this.currentUserSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  login(data:any){
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (res.user) {
          this.currentUserSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  fetchUser(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((user: any) => {
        const userData = user.user ? user.user : user;
        this.currentUserSignal.set(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }

  getUser(){
    return this.currentUser;
  }

  updateUser(data: any) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.apiUrl}/user`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((res: any) => {
        if (res.user) {
          this.currentUserSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  logout(){
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        this.currentUserSignal.set(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
    );
  }
}
