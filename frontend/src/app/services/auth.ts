import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

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
      this.fetchUser().subscribe({
        error: () => this.clearSession()
      });
    }
  }

  register(data:any){
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.user && res.token) {
          localStorage.setItem('token', res.token);
          this.currentUserSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  login(data:any){
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        if (res.user && res.token) {
          localStorage.setItem('token', res.token);
          this.currentUserSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  fetchUser(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) return of(null);
    
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((user: any) => {
        const userData = user.user ? user.user : user;
        this.currentUserSignal.set(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }),
      catchError((err) => {
        if (err.status === 401) {
          this.clearSession();
        }
        return of(null);
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
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  private clearSession() {
    this.currentUserSignal.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
