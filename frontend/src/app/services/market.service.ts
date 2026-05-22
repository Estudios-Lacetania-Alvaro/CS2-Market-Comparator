import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  // Ruta base de l'API backend
  private apiUrl = '/api';
  // Memòria cau per emmagatzemar els skins al frontend
  private skinsCache: {success: boolean, data: any[]} | null = null;

  constructor(private http: HttpClient) {}

  // Obtenir tots els skins de la botiga (amb suport per a memòria cau)
  getMarketSkins(forceRefresh = false): Observable<{success: boolean, data: any[]}> {
    // Si tenim dades a la memòria cau i no es força la recàrrega, les retornem immediatament
    if (this.skinsCache && !forceRefresh) {
      return of(this.skinsCache);
    }
    // Si no, fem la crida HTTP al backend i actualitzem la memòria cau
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/market/skins`).pipe(
      tap(res => {
        if (res.success) {
          this.skinsCache = res;
        }
      })
    );
  }

  // Obtenir elements actius de DMarket
  getDMarketItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/market/dmarket-items`);
  }

  // Executar l'ordre de compra d'un skin i netejar la memòria cau
  buySkin(skinId: number, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/operations/buy`, { skin_id: skinId, price: price }).pipe(
      tap(() => this.clearCache())
    );
  }

  // Executar la venda d'un asset de l'inventari i netejar la memòria cau
  sellSkin(inventoryId: number, sellPrice: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/operations/sell/${inventoryId}`, { sell_price: sellPrice }).pipe(
      tap(() => this.clearCache())
    );
  }

  // Obtenir detalls complets d'un skin específic
  getSkinDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/market/skins/${id}`);
  }

  // Netejar manualment la memòria cau de skins
  clearCache() {
    this.skinsCache = null;
  }
}
