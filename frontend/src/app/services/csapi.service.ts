import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Servei per interactuar amb les dades de l'API de CS:GO competitiu (HLTV, rànquings, partits).
 */
@Injectable({
  providedIn: 'root'
})
export class CsapiService {
  private http = inject(HttpClient);
  // Ruta base de l'API per a les estadístiques professionals de CS
  private apiUrl = '/api/pro';

  /**
   * Obté el rànquing mundial actual dels equips de CS:GO/CS2.
   */
  getRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rankings`);
  }

  /**
   * Obté els últims partits competitius i els seus resultats.
   */
  getLatestMatches(): Observable<any> {
    return this.http.get(`${this.apiUrl}/matches`);
  }

  /**
   * Obté les estadístiques de rendiment dels millors jugadors professionals.
   */
  getPlayerStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/players`);
  }
}
