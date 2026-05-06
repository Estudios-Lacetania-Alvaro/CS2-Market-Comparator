import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../services/market.service';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compra.html',
  styleUrls: ['./compra.css']
})
export class Compra implements OnInit {
  skins = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(private marketService: MarketService) {}

  ngOnInit() {
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
}
