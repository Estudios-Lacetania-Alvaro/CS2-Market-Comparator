import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketService } from '../../services/market.service';
import { AuthService } from '../../services/auth';
import { InventoryService } from '../../services/inventory.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './market.html',
  styleUrls: ['./market.css']
})
export class Market implements OnInit {
  private marketService = inject(MarketService);
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  skins = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Filters
  searchQuery = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(1000);
  selectedType = signal<string>('All');
  recommendationFilter = signal<string>('All');
  
  // Image Preview
  selectedImage = signal<string | null>(null);
  
  // Sorting
  sortField = signal<string>('net_profit_usd');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Transaction Modal
  transactionModal = signal<any | null>(null);
  customPrice = signal<number>(0);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  
  // Computed stats
  totalListings = computed(() => this.skins().length);
  profitableOps = computed(() => this.skins().filter(s => (s.net_profit_usd || 0) > 5).length);

  // Filtered and Sorted skins (Base for pagination)
  filteredSkins = computed(() => {
    let result = this.skins().filter(skin => {
      const matchesSearch = skin.name.toLowerCase().includes(this.searchQuery().toLowerCase());
      const price = skin.dmarket_price || 0;
      const matchesPrice = price >= this.minPrice() && price <= this.maxPrice();
      const matchesType = this.selectedType() === 'All' || skin.name.includes(this.selectedType());
      
      let matchesRecommendation = true;
      if (this.recommendationFilter() !== 'All') {
        const filter = this.recommendationFilter().toLowerCase();
        const rec = (skin.recommendation || '').toLowerCase();
        matchesRecommendation = rec.includes(filter);
      }
      
      return matchesSearch && matchesPrice && matchesType && matchesRecommendation;
    });

    // Apply Sorting
    return result.sort((a, b) => {
      const field = this.sortField();
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      const valA = a[field] || 0;
      const valB = b[field] || 0;
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  });

  // Paginated skins for the view
  paginatedSkins = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredSkins().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.filteredSkins().length / this.pageSize()));

  constructor() {
    // Reset to page 1 when filters change
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

  fetchData() {
    this.loading.set(true);
    this.marketService.getMarketSkins().subscribe({
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

  // Formatting helpers
  getFee(steamPrice: number): number {
    return +(steamPrice * 0.10).toFixed(2);
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

  goToPage(page: number) {
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
}
