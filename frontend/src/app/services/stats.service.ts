import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Servei per gestionar les estadístiques de l'usuari i l'evolució dels preus dels skins.
 */
@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  // Ruta base de l'API de estadístiques i mètriques
  private apiUrl = '/api/stats';

  /**
   * Obté el benefici realitzat per l'usuari durant un període determinat (setmana, mes, any o històric complet).
   */
  getRealizedProfit(period: string = 'month'): Observable<any> {
    return this.http.get(`${this.apiUrl}/realized-profit?period=${period}`);
  }

  /**
   * Obté l'evolució del preu d'un skin específic mitjançant el seu identificador.
   */
  getSkinEvolution(skinId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/skin-evolution/${skinId}`);
  }

  /**
   * Obté el resum general d'activitat de l'usuari (compres totals, vendes, operacions realitzades).
   */
  getActivitySummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity-summary`);
  }
}
