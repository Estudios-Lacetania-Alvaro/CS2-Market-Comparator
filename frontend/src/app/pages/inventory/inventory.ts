import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { CurrencyService } from '../../services/currency.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, LoadingSpinnerComponent, RouterModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  public currencyService = inject(CurrencyService);

  inventory = signal<any[]>([]);
  history = signal<any[]>([]);
  loading = signal<boolean>(true);
  user = this.authService.currentUser;

  // Modal de transacció
  transactionModal = signal<any | null>(null);
  customPrice = signal<number>(0);

  // Cerca i paginació de l'inventari
  inventorySearch = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  
  filteredInventory = computed(() => {
    const query = this.inventorySearch().toLowerCase();
    let filtered = this.inventory();
    if (query) {
      filtered = filtered.filter(item => item.skin?.name.toLowerCase().includes(query));
    }
    return filtered;
  });

  paginatedInventory = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredInventory().slice(start, end);
  });
  totalPages = computed(() => Math.ceil(this.filteredInventory().length / this.pageSize()) || 1);

  // Cerca i pestanyes de l'historial
  historySearch = signal<string>('');
  currentTab = signal<string>('GENERAL');

  // Paginació de l'historial
  historyCurrentPage = signal<number>(1);
  historyPageSize = signal<number>(10);

  filteredHistoryFull = computed(() => {
    const query = this.historySearch().toLowerCase();
    const tab = this.currentTab();
    
    let filtered = this.history();
    
    // Filtrar per pestanya
    if (tab === 'PURCHASES') {
      filtered = filtered.filter(op => op.type.toUpperCase() === 'BUY');
    } else if (tab === 'SALES') {
      filtered = filtered.filter(op => op.type.toUpperCase() === 'SELL');
    }

    // Filtrar per cerca
    if (query) {
      filtered = filtered.filter(op => {
        const skinName = (op.user_item?.skin?.name || op.userItem?.skin?.name || '').toLowerCase();
        const typeStr = (op.type || '').toLowerCase();
        return skinName.includes(query) || typeStr.includes(query);
      });
    }
    
    return filtered;
  });

  filteredHistory = computed(() => {
    const start = (this.historyCurrentPage() - 1) * this.historyPageSize();
    const end = start + this.historyPageSize();
    return this.filteredHistoryFull().slice(start, end);
  });

  historyTotalPages = computed(() => Math.ceil(this.filteredHistoryFull().length / this.historyPageSize()) || 1);

  // Estadístiques
  totalInvested = computed(() => {
    return this.inventory().reduce((acc, item) => acc + (Number(item.purchase_price) || 0), 0);
  });

  currentValue = computed(() => {
    return this.inventory().reduce((acc, item) => acc + (Number(item.skin?.steam_price) || 0), 0);
  });

  roi = computed(() => {
    const invested = Number(this.totalInvested()) || 0;
    const current = Number(this.currentValue()) || 0;
    if (invested === 0) return 0;
    return ((current - invested) / invested) * 100;
  });

  monthlyBalance = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return this.history()
      .filter(op => {
        const opDate = new Date(op.created_at);
        return op.type.toUpperCase() === 'SELL' && 
               opDate.getMonth() === currentMonth && 
               opDate.getFullYear() === currentYear;
      })
      .reduce((acc, op) => acc + (Number(op.profit) || 0), 0);
  });

  constructor() {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading.set(true);
    this.inventoryService.getInventory().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data;
        this.inventory.set(data || []);
      }
    });

    this.inventoryService.getOperationsHistory().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data;
        this.history.set(data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onSell(item: any) {
    this.transactionModal.set(item);
    const suggestedPrice = item.skin?.steam_price || (item.purchase_price * 1.15).toFixed(2);
    this.customPrice.set(+suggestedPrice);
  }

  closeTransaction() {
    this.transactionModal.set(null);
  }

  confirmSell() {
    const item = this.transactionModal();
    if (!item) return;

    this.inventoryService.sellSkin(item.id, this.customPrice()).subscribe({
      next: (res: any) => {
        this.notify.show(`TRANSACTION SUCCESSFUL: Profit ${this.currencyService.format(res.profit)}`, 'success');
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
