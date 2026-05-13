import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMarketSkins() {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/market/skins`);
  }

  getDMarketItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/market/dmarket-items`);
  }

  buySkin(skinId: number, price: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/operations/buy`, { skin_id: skinId, price: price });
  }

  sellSkin(inventoryId: number, sellPrice: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/operations/sell/${inventoryId}`, { sell_price: sellPrice });
  }

  getSkinDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/market/skins/${id}`);
  }
}
