import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth'; // Ajustar la ruta si cal

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8000/api/ai';

  /**
   * Obté les recomanacions de l'IA adjuntant estrictament el token de Sanctum.
   */
  getRecommendations(): Observable<any> {
    // 1. Recuperem el token actiu mitjançant el nou mètode
    const token = this.authService.getToken();
    
    // 2. Construïm les capçaleres requerides pel middleware auth:sanctum
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    // 3. Executem la petició protegida
    return this.http.get(`${this.apiUrl}/recommendations`, { headers });
  }
}