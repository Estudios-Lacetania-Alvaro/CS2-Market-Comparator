import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketService } from '../../services/market.service';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './market.html',
  styleUrls: ['./market.css']
})
export class Market implements OnInit {
  skins = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Filters
  searchQuery = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(1000);
  selectedType = signal<string>('All');
  recommendationFilter = signal<string>('All');
  
  // Sorting
  sortField = signal<string>('net_profit_usd');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  // Computed stats
  totalListings = computed(() => this.skins().length);
  profitableOps = computed(() => this.skins().filter(s => (s.net_profit_usd || 0) > 5).length);

  // Filtered and Sorted skins
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

  constructor(private marketService: MarketService) {}

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
}
