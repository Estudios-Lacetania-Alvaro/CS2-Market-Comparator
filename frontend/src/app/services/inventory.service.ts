import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Obtenir l'inventari actual de l'usuari autenticat
  getInventory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/inventory`);
  }

  // Obtenir l'historial de transaccions i moviments de l'usuari
  getOperationsHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/operations-history`);
  }

  // Posar a la venda un skin de l'inventari de l'usuari
  sellSkin(inventoryId: number, sellPrice: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/operations/sell/${inventoryId}`, { sell_price: sellPrice });
  }
}
