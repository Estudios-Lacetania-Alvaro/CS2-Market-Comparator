import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/stats';

  getRealizedProfit(period: string = 'month'): Observable<any> {
    return this.http.get(`${this.apiUrl}/realized-profit?period=${period}`);
  }

  getSkinEvolution(skinId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/skin-evolution/${skinId}`);
  }

  getActivitySummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity-summary`);
  }
}
