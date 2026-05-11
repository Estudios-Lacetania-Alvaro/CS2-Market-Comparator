import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getInventory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/inventory`);
  }

  getOperationsHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/operations-history`);
  }

  sellSkin(inventoryId: number, sellPrice: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/operations/sell/${inventoryId}`, { sell_price: sellPrice });
  }
}
