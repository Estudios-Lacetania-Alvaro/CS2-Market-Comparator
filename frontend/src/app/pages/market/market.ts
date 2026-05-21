import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketService } from '../../services/market.service';
import { AuthService } from '../../services/auth';
import { InventoryService } from '../../services/inventory.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './market.html',
  styleUrls: ['./market.css']
})
export class Market implements OnInit {
  private marketService = inject(MarketService);
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private notify = inject(NotificationService);
  public currencyService = inject(CurrencyService);

  skins = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Filtres per a l'enllaç d'inputs (valors immediats)
  searchQueryInput = signal<string>('');
  minPriceInput = signal<number>(0);
  maxPriceInput = signal<number>(1000);

  // Senyals de filtre utilitzats en el bloc computat (valors amb debounce)
  searchQuery = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(1000);
  selectedType = signal<string>('All');
  recommendationFilter = signal<string>('All');
  
  // Vista prèvia de la imatge
  selectedImage = signal<string | null>(null);
  
  // Ordenació
  sortField = signal<string>('net_profit_usd');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Modal de transacció
  transactionModal = signal<any | null>(null);
  customPrice = signal<number>(0);

  // Temporitzadors per al debounce
  private debounceTimerSearch: any;
  private debounceTimerMinPrice: any;
  private debounceTimerMaxPrice: any;

  onSearchChange(value: string) {
    this.searchQueryInput.set(value);
    if (this.debounceTimerSearch) clearTimeout(this.debounceTimerSearch);
    this.debounceTimerSearch = setTimeout(() => {
      this.searchQuery.set(value);
    }, 300);
  }

  onMinPriceChange(value: number | null) {
    const val = value !== null ? value : 0;
    this.minPriceInput.set(val);
    if (this.debounceTimerMinPrice) clearTimeout(this.debounceTimerMinPrice);
    this.debounceTimerMinPrice = setTimeout(() => {
      this.minPrice.set(val);
    }, 300);
  }

  onMaxPriceChange(value: number | null) {
    const val = value !== null ? value : 1000;
    this.maxPriceInput.set(val);
    if (this.debounceTimerMaxPrice) clearTimeout(this.debounceTimerMaxPrice);
    this.debounceTimerMaxPrice = setTimeout(() => {
      this.maxPrice.set(val);
    }, 300);
  }

  // Paginació
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  
  // Estadístiques computades
  totalListings = computed(() => this.skins().length);
  profitableOps = computed(() => this.skins().filter(s => (s.net_profit_usd || 0) > 5).length);

  // Skins filtrats i ordenats (Base per a la paginació)
  filteredSkins = computed(() => {
    const skinsList = this.skins();
    if (!skinsList || skinsList.length === 0) return [];

    const search = this.searchQuery().toLowerCase().trim();
    const minP = this.minPrice();
    const maxP = this.maxPrice();
    const selType = this.selectedType();
    const recF = this.recommendationFilter().toLowerCase().trim();

    // 1. Filtrar
    const result = skinsList.filter(skin => {
      // Ha de tenir tots dos preus vàlids per ser considerat un llistat complet
      const hasPrices = skin.dmarket_price > 0 && skin.steam_price > 0;
      if (!hasPrices) return false;

      const price = skin.dmarket_price || 0;
      if (price < minP || price > maxP) return false;

      if (selType !== 'All' && !skin.name.includes(selType)) return false;

      if (search && !skin.name.toLowerCase().includes(search)) return false;

      if (recF !== 'all') {
        const rec = (skin.recommendation || '').toLowerCase();
        if (!rec.includes(recF)) return false;
      }

      return true;
    });

    // 2. Ordenar
    const field = this.sortField();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    return result.sort((a, b) => {
      const valA = Number(a[field]) || 0;
      const valB = Number(b[field]) || 0;
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  // Skins paginats per a la vista
  paginatedSkins = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredSkins().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.filteredSkins().length / this.pageSize()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // Mostrar sempre la primera pàgina
      pages.push(1);
      
      if (current > 3) {
        pages.push('...');
      }
      
      // Calcular les pàgines mitjanes
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push('...');
      }
      
      // Mostrar sempre l'última pàgina
      pages.push(total);
    }
    
    return pages;
  });

  constructor() {
    // Restablir a la pàgina 1 quan canvien els filtres
    effect(() => {
      this.searchQuery();
      this.minPrice();
      this.maxPrice();
      this.selectedType();
      this.recommendationFilter();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData(forceRefresh = false) {
    this.loading.set(true);
    this.marketService.getMarketSkins(forceRefresh).subscribe({
      next: (response) => {
        if (response.success) {
          this.skins.set(response.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  // Ajudants de format
  getFee(steamPrice: number | null | undefined): number {
    const val = Number(steamPrice) || 0;
    return +(val * 0.15).toFixed(2);
  }

  setRecommendation(filter: string) {
    this.recommendationFilter.set(filter);
  }

  toggleSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number | any) {
    this.currentPage.set(page);
  }

  openImagePreview(imageUrl: string) {
    this.selectedImage.set(imageUrl);
  }

  closeImagePreview() {
    this.selectedImage.set(null);
  }

  onBuy(skin: any) {
    this.transactionModal.set(skin);
    this.customPrice.set(skin.dmarket_price);
  }

  closeTransaction() {
    this.transactionModal.set(null);
  }

  confirmBuy() {
    const skin = this.transactionModal();
    if (!skin) return;

    this.marketService.buySkin(skin.id, this.customPrice()).subscribe({
      next: (res: any) => {
        this.notify.show(`PURCHASE SUCCESSFUL: ${skin.name}`, 'success');
        this.authService.fetchUser().subscribe();
        this.closeTransaction();
        this.fetchData();
      },
      error: (err) => {
        this.notify.show(err.error?.message || 'Transaction failed', 'error');
      }
    });
  }

  trackBySkin(index: number, skin: any): any {
    return skin.id;
  }
}
