import { Injectable, signal, computed } from '@angular/core';

export type CurrencyCode = 'USD' | 'EUR';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Signal per emmagatzemar la moneda seleccionada (per defecte USD)
  private _selectedCurrency = signal<CurrencyCode>((localStorage.getItem('selected_currency') as CurrencyCode) || 'USD');
  
  // Tipus de canvi fix (aproximat: 1 USD = 0.92 EUR)
  private _exchangeRate = signal<number>(0.92);

  // Selector públic per a la moneda actual
  selectedCurrency = computed(() => this._selectedCurrency());
  
  // Selector per al símbol de la moneda
  currencySymbol = computed(() => this._selectedCurrency() === 'USD' ? '$' : '€');

  /**
   * Canvia la moneda seleccionada i la guarda al localStorage
   */
  setCurrency(code: CurrencyCode) {
    this._selectedCurrency.set(code);
    localStorage.setItem('selected_currency', code);
  }

  /**
   * Converteix un import de USD a la moneda seleccionada
   */
  convert(amount: number | null | undefined): number {
    const val = Number(amount) || 0;
    if (this._selectedCurrency() === 'USD') {
      return val;
    }
    return val * this._exchangeRate();
  }

  /**
   * Formata un import amb el símbol i la moneda seleccionada
   */
  format(amount: number | null | undefined): string {
    const symbol = this.currencySymbol();
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return `${symbol}0.00`;
    }
    const converted = this.convert(amount);
    
    // Si és USD, el símbol va davant. Si és EUR, sol anar darrere en molts llocs, però el posarem davant per consistència en el dashboard.
    return `${symbol}${converted.toFixed(2)}`;
  }
}
