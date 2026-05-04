import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'

  constructor(private http:HttpClient) {}

  register(data:any){
    return this.http.post(`${this.apiUrl}/register`, data)
  }

  login(data:any){
    return this.http.post(`${this.apiUrl}/login`, data)
  }

  getUser(){
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
