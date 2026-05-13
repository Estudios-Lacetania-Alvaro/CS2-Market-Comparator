import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/ai';

  getRecommendations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendations`);
  }
}
