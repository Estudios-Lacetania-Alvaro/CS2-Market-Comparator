import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsapiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/pro';

  getRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rankings`);
  }

  getLatestMatches(): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches`);
  }

  getPlayerStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/players`);
  }
}
