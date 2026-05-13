import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  inventory = signal<any[]>([]);
  history = signal<any[]>([]);
  loading = signal<boolean>(true);
  user = this.authService.currentUser;

  // Transaction Modal
  transactionModal = signal<any | null>(null);
  customPrice = signal<number>(0);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  paginatedInventory = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.inventory().slice(start, end);
  });
  totalPages = computed(() => Math.ceil(this.inventory().length / this.pageSize()));

  // History Search & Tabs
  historySearch = signal<string>('');
  currentTab = signal<string>('GENERAL');

  filteredHistory = computed(() => {
    const query = this.historySearch().toLowerCase();
    const tab = this.currentTab();
    
    let filtered = this.history();
    
    // Filter by Tab
    if (tab === 'PURCHASES') {
      filtered = filtered.filter(op => op.type.toUpperCase() === 'BUY');
    } else if (tab === 'SALES') {
      filtered = filtered.filter(op => op.type.toUpperCase() === 'SELL');
    }

    // Filter by Search
    filtered = filtered.filter(op => 
      op.skin?.name.toLowerCase().includes(query) || 
      op.type.toLowerCase().includes(query)
    );
    
    return filtered.slice(0, 10);
  });

  // Stats
  totalInvested = computed(() => {
    return this.inventory().reduce((acc, item) => acc + (item.purchase_price || 0), 0);
  });

  currentValue = computed(() => {
    return this.inventory().reduce((acc, item) => acc + (item.skin?.steam_price || 0), 0);
  });

  roi = computed(() => {
    if (this.totalInvested() === 0) return 0;
    return ((this.currentValue() - this.totalInvested()) / this.totalInvested()) * 100;
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
      .reduce((acc, op) => acc + (op.profit || 0), 0);
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
        this.notify.show(`TRANSACTION SUCCESSFUL: Profit $${res.profit.toFixed(2)}`, 'success');
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
