import { Component, OnInit } from '@angular/core';
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
  skins: any[] = [];
  loading = true;

  constructor(private marketService: MarketService) {}

  ngOnInit() {
    this.marketService.getMarketSkins().subscribe({
      next: (response) => {
        if (response.success) {
          this.skins = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
