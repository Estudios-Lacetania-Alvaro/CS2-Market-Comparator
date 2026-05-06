import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMarketSkins() {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/market/skins`);
  }
}
